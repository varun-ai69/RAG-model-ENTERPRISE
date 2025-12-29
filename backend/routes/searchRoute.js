const express = require("express");
const { askQuestion } = require("../controllers/retrievalController")
const router = express.Router();

router.post("/retrieval", askQuestion); 

module.exports = router;
