const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/productController");

const { auth, isFarmer } = require("../middlewares/auth");

// Farmer only routes
router.post("/create", auth, isFarmer, createProduct);
router.put("/update/:id", auth, isFarmer, updateProduct);
router.delete("/delete/:id", auth, isFarmer, deleteProduct);
router.get("/my/listings", auth, isFarmer, getMyProducts);

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;