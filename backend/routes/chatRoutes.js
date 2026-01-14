const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");

const {
  createChat,
  listChats,
  getMessages,
  askQuestion
} = require("../controllers/chatController");



router.post("/chats", auth, createChat);


router.get("/chats", auth, listChats);


router.get("/chats/:sessionId/messages", auth, getMessages);



router.post("/chats/query", auth, askQuestion);

module.exports = router;
