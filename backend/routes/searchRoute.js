const express = require("express");
const { askQuestion } = require("../controllers/retrievalController")
const authMiddleware = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/retrieval", authMiddleware , askQuestion); 

module.exports = router;
