// models/chatMessage.js
const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatSession",
    required: true,
    index: true
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: {
    type: String,
    enum: ["USER", "ASSISTANT"],
    required: true
  },

  content: {
    type: String,
    required: true
  },

  contextChunks: [String], // chunk_ids used

  similarityScore: Number,

  

}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
