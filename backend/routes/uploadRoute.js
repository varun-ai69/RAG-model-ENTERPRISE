const express = require("express");
const { uploadSingle } = require("../middlewares/uploadMiddleware");
const { ingestDocument } = require("../controllers/ingestionController");
const authMiddleware = require("../middlewares/authMiddleware")
const role = require("../middlewares/roleMiddleware") //only ADMIN can upload the Documents 

const router = express.Router();

router.post("/ingestion", authMiddleware, role(["ADMIN"]), uploadSingle, ingestDocument); 

module.exports = router;
