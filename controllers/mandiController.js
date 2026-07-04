const https = require("https");

const fetchFromMandi = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      hostname: process.env.RAPIDAPI_HOST,
      path,
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid JSON response"));
        }
      });
    });

    // Timeout 10 seconds
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.on("error", reject);
    req.end();
  });
};

// Get prices by crop
exports.getPricesByCrop = async (req, res) => {
  try {
    const { crop } = req.params;
    // console.log("Fetching mandi prices for:", crop); 
    const data = await fetchFromMandi(
      `/api/mandi/prices/crop/${encodeURIComponent(crop)}`
    );
   // console.log("Data received:", data);  
    return res.status(200).json({
      success: true,
      count: data.length,
      prices: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mandi prices",
      error: error.message,
    });
  }
};

// Get prices by state
exports.getPricesByState = async (req, res) => {
  try {
    const { state, crop } = req.query;

    if (!crop) {
      return res.status(400).json({
        success: false,
        message: "Crop name required",
      });
    }

    const data = await fetchFromMandi(
      `/api/mandi/prices/crop/${encodeURIComponent(crop)}`
    );

    // Filter by state if provided
    const filtered = state
      ? data.filter((item) =>
          item.state.toLowerCase().includes(state.toLowerCase())
        )
      : data;

    return res.status(200).json({
      success: true,
      count: filtered.length,
      prices: filtered,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mandi prices",
      error: error.message,
    });
  }
};