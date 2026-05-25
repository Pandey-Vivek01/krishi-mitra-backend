const mongoose = require("mongoose");
const RecommendCrop = require("../models/recommendCropModel");
const crops = require("../data/recommendCropsData.json");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/krishimitra")
  .then(async () => {
    console.log("Connected to MongoDB");

    // Optional: clear existing data
    await RecommendCrop.deleteMany({});
    console.log("Existing crops deleted");

    // Insert new crops
    await RecommendCrop.insertMany(crops);
    console.log("Recommendation crops seeded successfully!");

    process.exit();
  })
  .catch(err => console.log(err));
