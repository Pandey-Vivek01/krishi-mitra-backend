const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    index: true, // allows faster search by region
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  rainfall: {
    type: Number,
    default: 0, // if no rain, default to 0
  },
  season: {
    type: String,
    enum: ["Summer", "Winter","Kharif", "Rabi"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // when the record is saved
  },
  // Optional fields for future extensions
  windSpeed: { type: Number },
  pressure: { type: Number },
  source: { type: String, default: "openweathermap" }, // manual, sensor, API
});

weatherSchema.index({ region: 1, date: -1 }); // helps fetch latest weather per region quickly

module.exports = mongoose.model("Weather", weatherSchema);
