const RecommendCrop = require("../models/recommendCropModel");
const Weather = require("../models/weatherModel");

// POST /api/auto-recommend
// Body: { location, soilType }
async function autoRecommend(req, res) {
  try {
    const { location, soilType } = req.body;

    if (!location || !soilType) {
      return res.status(400).json({ message: "Provide location and soilType" });
    }

    // Fetch latest weather for the location
    const weather = await Weather.findOne({ region: location }).sort({ date: -1 });
    if (!weather) return res.status(404).json({ message: "Weather data not found for this location" });

    // Fetch all crops for the soil type
    // const crops = await RecommendCrop.find({ optimalSoilType: soilType });
    console.log("Looking for crops with soilType:", soilType);
    const crops = await RecommendCrop.find({ optimalSoilType: soilType,
      season: weather.season
     });
    console.log("Crops found:", crops);
    
    if (!crops || crops.length === 0) {
      return res.status(404).json({ message: "No crops found for this soil type" });
    }

    // Calculate suitability scores
    const recommendations = crops.map(crop => {
      const tempScore = Math.max(0, 100 - Math.abs(weather.temperature - ((crop.minTemp + crop.maxTemp) / 2)));
      const humidityScore = Math.max(0, 100 - Math.abs(weather.humidity - ((crop.minHumidity + crop.maxHumidity) / 2)));
      const rainfallScore = Math.max(0, 100 - Math.abs(weather.rainfall - ((crop.minRainfall + crop.maxRainfall) / 2)));

      const totalScore = Math.round((tempScore * 0.4) + (humidityScore * 0.3) + (rainfallScore * 0.3));

      return {
        cropName: crop.name,
        season: crop.season,
        suitabilityScore: totalScore
      };
    });

    // Sort by highest suitability score and take top 5
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    const topCrops = recommendations.slice(0, 5);

    res.status(200).json({
      location: weather.region,
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall
      },
      soilType,
      recommendations: topCrops
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get recommendations", error: err.message });
  }
}

module.exports = { autoRecommend };

