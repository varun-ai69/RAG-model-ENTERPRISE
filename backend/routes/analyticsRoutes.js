const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const UnansweredQuery = require("../models/unansweredQuery");

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

module.exports = router;
