const express = require("express");
const router = express.Router();
const {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");

const { auth } = require("../middlewares/auth");

router.post("/conversation", auth, getOrCreateConversation);
router.get("/conversations", auth, getMyConversations);
router.get("/messages/:conversationId", auth, getMessages);
router.post("/message", auth, sendMessage);

module.exports = router;