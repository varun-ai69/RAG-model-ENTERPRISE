//PRODUCTION RETRIEVAL CONTROLLER IS THIS USER ASK QUERY AND IT WORKOUT HERE 


const ChatSession = require("../models/chatSession");
const ChatMessage = require("../models/chatMessage");
const UnansweredQuery = require("../models/unansweredQuery");

const { embedQuery } = require("../services/embeddingService");
const { searchVectors } = require("../services/vectorDB")
const { askLLM ,generateChatTitle} = require("../services/llmService")



//CREATING SESSION
exports.createChat = async (req, res) => {
  try {
    const session = await ChatSession.create({
      companyId: req.user.companyId,
      userId: req.user.userId
    });

    res.status(201).json({
      sessionId: session._id,
      title: session.title
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create chat" });
  }
};

//GET ALL CHATS
exports.listChats = async (req, res) => {
  const chats = await ChatSession.find({
    companyId: req.user.companyId,
    userId: req.user.userId
  }).sort({ lastMessageAt: -1 });

  res.json(chats);
};

//GET EACH MESSAGE OF EACH CHAT 
exports.getMessages = async (req, res) => {
  const messages = await ChatMessage.find({
    sessionId: req.params.sessionId,
    companyId: req.user.companyId
  }).sort({ createdAt: 1 });

  res.json(messages);
};



exports.askQuestion = async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    if (!question || !sessionId) {
      return res.status(400).json({ error: "Question and sessionId are required" });
    }

    const companyId = req.user.companyId;
    const userId = req.user.userId;

    // 🔹 Fetch session
    const session = await ChatSession.findOne({
      _id: sessionId,
      companyId
    });

    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    // 🔹 Save USER message
    await ChatMessage.create({
      sessionId,
      companyId,
      userId,
      role: "USER",
      content: question
    });

    // 1️⃣ Embed question
    const queryEmbedding = await embedQuery(question);

    // 2️⃣ Retrieve chunks
    const results = await searchVectors(queryEmbedding, companyId, 5);

    const bestScore = results[0]?.score || 0;

    // 3️⃣ If no good context → log unanswered
    if (bestScore < 0.3) {
      await UnansweredQuery.create({
        companyId,
        userId,
        sessionId,
        question,
        similarityScore: bestScore,
        reason: "NO_CONTEXT"
      });

      session.hasUnanswered = true;
      await session.save();

      const fallback = "I could not find this information in the provided documents.";

      await ChatMessage.create({
        sessionId,
        companyId,
        userId,
        role: "ASSISTANT",
        content: fallback,
        similarityScore: bestScore
      });

      return res.json({
        question,
        answer: fallback,
        sources: []
      });
    }

   
    const context = results.map(r => r.payload.text).join("\n");

    const answer = await askLLM(context, question);

    await ChatMessage.create({
      sessionId,
      companyId,
      userId,
      role: "ASSISTANT",
      content: answer,
      contextChunks: results.map(r => r.payload.document_id),
      similarityScore: bestScore
    });

    if (session.totalMessages === 0) {
      const title = await generateChatTitle(question);
      session.title = title;
    }

    session.totalMessages += 2;
    session.lastMessageAt = new Date();
    await session.save();

    res.json({
      question,
      answer,
      sources: results.map(r => ({
        chunk_id: r.id,
        source: r.payload.source,
        score: r.score
      }))
    });

  } catch (err) {
    console.error("RAG ERROR:", err);
    res.status(500).json({ error: "Failed to generate answer" });
  }
};


// Delete a chat (soft delete)
exports.deleteChat = async (req, res) => {
  try {
    const chat = await ChatSession.findOne({
      _id: req.params.sessionId,
      companyId: req.user.companyId,
      userId: req.user.userId
    });

    if (!chat) return res.status(404).json({ error: "Chat not found" });

    await ChatMessage.deleteMany({ sessionId: chat._id });

    await chat.deleteOne();

    res.json({ message: "Chat deleted" });
  } catch (err) {
    console.error("DELETE CHAT ERROR:", err);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};


// Rename chat
exports.renameChat = async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await ChatSession.findOne({
      _id: req.params.sessionId,
      companyId: req.user.companyId,
      userId: req.user.userId
    });

    if (!chat) return res.status(404).json({ error: "Chat not found" });

    chat.title = title;
    await chat.save();

    res.json({ message: "Chat renamed", title });
  } catch (err) {
    console.error("RENAME CHAT ERROR:", err);
    res.status(500).json({ error: "Failed to rename chat" });
  }
};


// Export chat (for compliance)
exports.exportChat = async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      sessionId: req.params.sessionId,
      companyId: req.user.companyId
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("EXPORT CHAT ERROR:", err);
    res.status(500).json({ error: "Failed to export chat" });
  }
};
