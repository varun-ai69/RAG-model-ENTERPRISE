
//this is for just testing RAG model retrieval without chat session

const express = require("express");
const { askQuestion } = require("../controllers/retrievalController")
const authMiddleware = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/retrieval", authMiddleware , askQuestion); 

module.exports = router;
