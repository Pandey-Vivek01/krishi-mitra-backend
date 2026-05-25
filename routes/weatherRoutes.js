const express = require("express");
const router = express.Router();
const { fetchWeather } = require("../controllers/weatherFetchController");

router.get("/fetch", fetchWeather);

module.exports = router;
