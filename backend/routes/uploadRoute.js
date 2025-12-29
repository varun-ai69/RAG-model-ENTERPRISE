const express = require("express");
const { uploadSingle } = require("../middlewares/uploadMiddleware");
const { ingestDocument } = require("../controllers/ingestionController");

const router = express.Router();

router.post("/ingestion", uploadSingle, ingestDocument); 

module.exports = router;
