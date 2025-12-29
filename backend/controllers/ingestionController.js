/**
 * Ingestion Controller (RAG System – Data Preparation Layer system-1)
 *
 * This controller is responsible for the first stage of the RAG pipeline.
 * It handles the ingestion of raw input data and prepares it for retrieval-based
 * generation by converting unstructured content into structured, searchable form.
 *
 * The controller performs the following tasks:
 * - Accepts raw text extracted from documents or files
 * - Cleans and normalizes the content
 * - Splits the text into meaningful semantic chunks
 * - Prepares each chunk for embedding and storage in the vector database
 *
 * This module represents the "training" or ingestion side of the RAG system.
 * It does NOT handle user queries or answer generation.
 * Its only responsibility is to convert raw knowledge into retrievable data.
 */



const { extractText } = require("../services/textExtractor");
const { chunkText } = require("../services/chunkGenerator")
const { generateEmbeddings } = require("../services/embeddingService");
const { initVectorDB, insertVectors } = require("../services/vectorDB");


const fs = require("fs");

exports.ingestDocument = async (req, res) => {
  try {
   
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
   


    // Step 1: Extract text from file
    const rawText = await extractText(req.file.path);

    if (!rawText || rawText.length < 20) {
      return res.status(400).json({ error: "Text extraction failed" });
    }

    // Step 2: chunks the rawText 
   const chunks = chunkText(rawText, {source: req.file.originalname});

   // Step 3: now each chunk converted to embededChunks
   const embeddedChunks = await generateEmbeddings(chunks);
   
   // Step 4: each embededChunks is stored in vectorDatabase (currently using qdrant for vectorDB)
   await initVectorDB();          // run once (safe to call multiple times)
   await insertVectors(embeddedChunks);

    
  return res.status(200).json({
      success: true,
      message: "Document indexed successfully",
      totalChunks: embeddedChunks.length
    });


  } catch (err) {
    console.error("Ingestion Error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to process document"
    });
  }
};
