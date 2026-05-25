const mongoose = require("mongoose");

const recommendCropSchema = new mongoose.Schema({
  name: { type: String, required: true },                 // Crop name
  season: { type: String, enum: ["Summer", "Winter", "Kharif", "Rabi"], required: true },
  optimalSoilType: { type: String, required: true },      // Soil type for this crop

  // Environmental fields for recommendation
  minTemp: { type: Number, required: true },
  maxTemp: { type: Number, required: true },
  minHumidity: { type: Number, required: true },
  maxHumidity: { type: Number, required: true },
  minRainfall: { type: Number, required: true },
  maxRainfall: { type: Number, required: true },

  // Optional additional info
  fertilizerTips: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Optional: index for faster querying by soil type + season
recommendCropSchema.index({ optimalSoilType: 1, season: 1, name: 1 });

module.exports = mongoose.model("RecommendCrop", recommendCropSchema);
