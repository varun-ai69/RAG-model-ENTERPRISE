// models/unansweredQuery.js
const mongoose = require("mongoose");

const unansweredSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatSession"
  },

  question: String,

  similarityScore: Number,

  reason: {
    type: String,
    enum: ["NO_CONTEXT", "LOW_CONFIDENCE"]
  },

  resolved: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("UnansweredQuery", unansweredSchema);
