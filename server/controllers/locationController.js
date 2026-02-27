const Location = require("../models/Location");

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });

    res.status(200).json({
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch locations",
      error: error.message
    });
  }
};