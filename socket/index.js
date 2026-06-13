const { Server } = require("socket.io");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Online users map — userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins with their userId
    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log(`User ${userId} is online`);
    });

    // Join a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });

    // Send message
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, senderId, text } = data;

        // Save to DB
        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text,
        });

        // Update lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          updatedAt: Date.now(),
        });

        const populated = await message.populate("sender", "firstName lastName");

        // Broadcast to everyone in the room
        io.to(conversationId).emit("receive_message", populated);
      } catch (error) {
        console.log("Socket send_message error:", error.message);
      }
    });

    // Typing indicator
    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_typing", { userId });
    });

    socket.on("stop_typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_stop_typing", { userId });
    });

    // Mark messages as seen
    socket.on("mark_seen", async ({ conversationId, userId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, seen: false },
          { seen: true }
        );
        io.to(conversationId).emit("messages_seen", { conversationId, userId });
      } catch (error) {
        console.log("Socket mark_seen error:", error.message);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      });
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = initSocket;