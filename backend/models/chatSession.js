// models/chatSession.js
const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
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

  title: {
    type: String,
    default: "New Chat"
  },

  status: {
    type: String,
    enum: ["ACTIVE", "ARCHIVED"],
    default: "ACTIVE"
  },

  model: {
    type: String,
    default: "GEMINI-3-FLASH-PREVIEW"
  },

  lastMessageAt: {
    type: Date
  },

  totalMessages: {
    type: Number,
    default: 0
  },

  hasUnanswered: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
