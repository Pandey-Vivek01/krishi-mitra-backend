const express = require("express");
const router = express.Router();

const {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
} = require("../controllers/postController");

const { auth, isExpert } = require("../middlewares/auth");

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Expert only routes
router.post("/create", auth, isExpert, createPost);
router.put("/:id", auth, isExpert, updatePost);
router.delete("/:id", auth, isExpert, deletePost);

// Auth required (any logged in user)
router.post("/:id/like", auth, toggleLike);
router.post("/:id/comment", auth, addComment);

module.exports = router;