const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");

const {
  createChat,
  listChats,
  getMessages,
  askQuestion,
  deleteChat,
  renameChat,
  exportChat
} = require("../controllers/chatController");



router.post("/chats", auth, createChat);


router.get("/chats", auth, listChats);


router.get("/chats/:sessionId/messages", auth, getMessages);




router.post("/chats/query", auth, askQuestion);


// Chat management routes
router.delete("/chats/:sessionId", auth, deleteChat);
router.patch("/chats/:sessionId", auth, renameChat);
router.get("/chats/:sessionId/export", auth, exportChat);

module.exports = router;
