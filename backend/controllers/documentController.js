const fs = require("fs");
const Document = require("../models/document");
const { extractText } = require("../services/textExtractor");
const { chunkText } = require("../services/chunkGenerator");
const { generateEmbeddings } = require("../services/embeddingService");
const { insertVectors, deleteVectorsByDocument } = require("../services/vectorDB");

/* ===========================
   📄 List all documents
=========================== */
exports.listDocuments = async (req, res) => {
  const docs = await Document.find({
    companyId: req.user.companyId,
    status: { $ne: "DELETED" }
  }).sort({ createdAt: -1 });

  res.json(docs);
};

/* ===========================
   🗑 Delete document
=========================== */
exports.deleteDocument = async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id,
    companyId: req.user.companyId
  });

  if (!doc) return res.status(404).json({ error: "Document not found" });

  // 1️⃣ Delete vectors
  await deleteVectorsByDocument(doc._id.toString());

  // 2️⃣ Delete file
  if (fs.existsSync(doc.filePath)) {
    fs.unlinkSync(doc.filePath);
  }

  // 3️⃣ Soft delete in DB
  doc.status = "DELETED";
  await doc.save();

  res.json({ message: "Document deleted" });
};

/* ===========================
   🔄 Reindex document
=========================== */
exports.reindexDocument = async (req, res) => {
  let doc;

  try {
    doc = await Document.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!fs.existsSync(doc.filePath)) {
      doc.status = "FAILED";
      await doc.save();
      return res.status(400).json({ error: "File missing on server" });
    }

    // Mark as processing
    doc.status = "PROCESSING";
    await doc.save();

    // 1️⃣ Delete old vectors
    await deleteVectorsByDocument(doc._id.toString());

    // 2️⃣ Extract text
    const rawText = await extractText(doc.filePath);

    // 3️⃣ Chunk
    const chunks = chunkText(rawText, {
      documentId: doc._id.toString(),
      source: doc.originalFileName
    });

    // 4️⃣ Embed
    const embedded = await generateEmbeddings(chunks);

    // 5️⃣ Insert vectors
    await insertVectors(embedded, doc.companyId);

    // 6️⃣ Update document
    doc.chunkCount = embedded.length;
    doc.lastIndexedAt = new Date();
    doc.status = "ACTIVE";
    await doc.save();

    res.json({ message: "Document reindexed successfully" });

  } catch (err) {
    console.error("Reindex error:", err);

    if (doc) {
      doc.status = "FAILED";
      await doc.save();
    }

    res.status(500).json({ error: "Reindex failed" });
  }
};
