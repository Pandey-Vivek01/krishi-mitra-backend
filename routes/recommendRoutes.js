
const express = require("express");
const router = express.Router();
const { autoRecommend } = require("../controllers/autoRecommendationController");

router.post("/", autoRecommend);

module.exports = router;
