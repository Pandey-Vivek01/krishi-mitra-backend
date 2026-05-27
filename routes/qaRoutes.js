const express = require("express");
const router = express.Router();

const {
    askQuestion,
    getAllQuestions,
    getQuestionById,
    answerQuestion,
    deleteQuestion,
    toggleLike,
} = require("../controllers/qaController");

const { auth, isFarmer, isExpert } = require("../middlewares/auth");

// Public routes
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);

// Farmer only
router.post("/ask", auth, isFarmer, askQuestion);
router.delete("/:id", auth, isFarmer, deleteQuestion);

// Expert only
router.post("/:id/answer", auth, isExpert, answerQuestion);

// Any logged in user
router.post("/:id/like", auth, toggleLike);

module.exports = router;