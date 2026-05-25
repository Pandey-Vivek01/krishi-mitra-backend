const Weather = require("../models/weatherModel"); // your Weather schema
const { getWeatherByCity, getWeatherByCoords } = require("../services/openWeather");

// GET /api/weather/fetch?city=Patna
// or GET /api/weather/fetch?lat=25.61&lon=85.14
async function fetchWeather(req, res) {
  try {
    const { city, lat, lon } = req.query;
    let weather;

    if (city) {
      weather = await getWeatherByCity(city);
    } else if (lat && lon) {
      weather = await getWeatherByCoords(lat, lon);
    } else {
      return res.status(400).json({ message: "Please provide city or lat/lon" });
    }

    //Sirf cache karo (1 hour purana ho toh fetch, warna DB se do)
      const existing = await Weather.findOne({ 
      region: weather.region,
       createdAt: { $gte: new Date(Date.now() - 60*60*1000) } // 1 hour
    });

    if(!existing){
     await Weather.create({ ...weather });
}

    res.status(200).json({ message: "Weather fetched successfully", weather });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch weather" });
  }
}

module.exports = { fetchWeather };
