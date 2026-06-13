const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Get or Create Conversation (Buyer clicks "Chat with Farmer")
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { farmerId, productId } = req.body;
    const buyerId = req.user.id;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [buyerId, farmerId] },
      product: productId || null,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [buyerId, farmerId],
        product: productId || null,
      });
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get or create conversation",
      error: error.message,
    });
  }
};

// Get all conversations of a user
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "firstName lastName email")
      .populate("product", "cropName images")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// Get all messages of a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "firstName lastName")
      .sort({ createdAt: 1 });

    // Mark messages as seen
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user.id }, seen: false },
      { seen: true }
    );

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// Send Message (REST fallback — main sending via Socket.io)
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
    });

    // Update lastMessage in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt: Date.now(),
    });

    const populated = await message.populate("sender", "firstName lastName");

    return res.status(201).json({ success: true, message: populated });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};