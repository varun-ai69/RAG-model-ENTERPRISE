const ChatMessage = require("../models/chatMessage");
const UnansweredQuery = require("../models/unansweredQuery");
const Document = require("../models/document");

// Chat usage analytics - aggregates message count per user
exports.chatUsage = async (req, res) => {
    try {
        const data = await ChatMessage.aggregate([
            { $match: { companyId: req.user.companyId } },
            { $group: { _id: "$userId", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);
        res.status(200).json(data);
    } catch (err) {
        console.error("CHAT USAGE ERROR:", err);
        res.status(500).json({ error: "Failed to fetch chat usage" });
    }
};


// Document usage analytics - tracks which documents are used most in context
exports.documentUsage = async (req, res) => {
    try {
        const data = await ChatMessage.aggregate([
            { $match: { companyId: req.user.companyId } },
            { $unwind: "$contextChunks" },
            { $group: { _id: "$contextChunks", usage: { $sum: 1 } } },
            { $sort: { usage: -1 } }
        ]);

        res.json(data);
    } catch (err) {
        console.error("DOCUMENT USAGE ERROR:", err);
        res.status(500).json({ error: "Failed to fetch document usage" });
    }
};
