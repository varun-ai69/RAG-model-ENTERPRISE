const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

  
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    
    originalFileName: {
      type: String,
      required: true
    },

    storedFileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    fileType: {
      type: String,
      required: true
    },

    fileSize: {
      type: Number
    },

   
    chunkCount: {
      type: Number,
      default: 0
    },

    embeddingModel: {
      type: String,
      default: "all-MiniLM-L6-v2"
    },

    status: {
      type: String,
      enum: ["PROCESSING", "ACTIVE", "FAILED", "DELETED"],
      default: "PROCESSING",
      index: true
    },

    lastIndexedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
