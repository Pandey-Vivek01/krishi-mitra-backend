const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  getOrderById,
} = require("../controllers/orderController");

const { auth, isFarmer, isBuyer } = require("../middlewares/auth");

// Buyer routes
router.post("/place", auth, isBuyer, placeOrder);
router.get("/my-orders", auth, isBuyer, getMyOrders);

// Farmer routes
router.get("/farmer-orders", auth, isFarmer, getFarmerOrders);
router.put("/status/:id", auth, isFarmer, updateOrderStatus);

// Common (both buyer and farmer)
router.get("/:id", auth, getOrderById);

module.exports = router;