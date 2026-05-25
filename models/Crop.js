const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String, // URL (can use Cloudinary)
  },
  location: {
    type: String,
    required: true,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
} , { timestamps: true });

module.exports = mongoose.model("Crop", cropSchema);
