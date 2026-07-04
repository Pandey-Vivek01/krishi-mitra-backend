const express = require("express");
const router = express.Router();
const {
  getPricesByCrop,
  getPricesByState,
} = require("../controllers/mandiController");

const { auth } = require("../middlewares/auth");

router.get("/crop/:crop", auth, getPricesByCrop);
router.get("/state", auth, getPricesByState);

module.exports = router;