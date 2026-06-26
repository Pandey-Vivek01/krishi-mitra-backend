const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const { auth, isBuyer } = require("../middlewares/auth");

router.post("/create-order", auth, isBuyer, createRazorpayOrder);
router.post("/verify", auth, isBuyer, verifyPayment);

module.exports = router;