const axios = require("axios");

// Fetch by city name
async function getWeatherByCity(city) {
  try {
    const key = process.env.OPENWEATHER_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`;
    const resp = await axios.get(url);
    const d = resp.data;
    return {
      region: d.name,
      temperature: d.main.temp,
      humidity: d.main.humidity,
      rainfall: d.rain?.['1h'] || 0,
      season: determineSeason(new Date()),
      //raw: d, //poora API response store ho raha hai (unnecessary)
    };
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    throw new Error("Unable to fetch weather data");
  }
}

// Fetch by latitude & longitude
async function getWeatherByCoords(lat, lon) {
  try {
    const key = process.env.OPENWEATHER_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    const resp = await axios.get(url);
    const d = resp.data;
    return {
      region: d.name,
      temperature: d.main.temp,
      humidity: d.main.humidity,
      rainfall: d.rain?.['1h'] || 0,
      season: determineSeason(new Date()),
     // raw: d,
    };
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    throw new Error("Unable to fetch weather data");
  }
}

//  function to determine season by month
function determineSeason(date) {
  const month = date.getMonth() + 1; // 0-indexed
  if (month >= 6 && month <= 9) return "Kharif";
  if (month >= 10 && month <= 11) return "Rabi";
  if (month >=3 && month <= 5) return "Summer";
  return "Winter";
}

module.exports = { getWeatherByCity, getWeatherByCoords };
