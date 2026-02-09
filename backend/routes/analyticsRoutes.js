const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const UnansweredQuery = require("../models/unansweredQuery");
const { chatUsage, documentUsage } = require("../controllers/analyticsController");

// List unanswered questions for company
router.get(
  "/analytics/unanswered-queries",
  auth,
  role(["ADMIN"]),
  async (req, res) => {
    const data = await UnansweredQuery.find({
      companyId: req.user.companyId
    }).sort({ createdAt: -1 });

    res.json(data);
  }
);

// Chat usage analytics routes
router.get("/analytics/chat-usage", auth, role(["ADMIN"]), chatUsage);

// Document usage analytics routes
router.get("/analytics/document-usage", auth, role(["ADMIN"]), documentUsage);

module.exports = router;

