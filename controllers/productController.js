const Product = require("../models/Product");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create Product Listing (Farmer only)
exports.createProduct = async (req, res) => {
  try {
    const { cropName, description, quantity, unit, pricePerUnit, location } = req.body;
    const farmerId = req.user.id;

    if (!cropName || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: "cropName, quantity, and pricePerUnit are required",
      });
    }

    // Handle image uploads (optional)
    let imageUrls = [];
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const image of images) {
        const uploaded = await uploadImageToCloudinary(image, "krishi_mitra/products");
        imageUrls.push(uploaded.secure_url);
      }
    }

    const product = await Product.create({
      farmer: farmerId,
      cropName,
      description,
      quantity,
      unit,
      pricePerUnit,
      location,
      images: imageUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Get All Products (Buyer browses)
exports.getAllProducts = async (req, res) => {
  try {
    const { cropName, minPrice, maxPrice, location } = req.query;

    let filter = { status: "available" };

    if (cropName) filter.cropName = { $regex: cropName, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (minPrice || maxPrice) {
      filter.pricePerUnit = {};
      if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate("farmer", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "firstName lastName email"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Update Product (Farmer only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Only the farmer who created it can update
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete Product (Farmer only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// Get Farmer's own listings
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your products",
      error: error.message,
    });
  }
};