const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      default: "kg",
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "sold_out"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);