require("dotenv").config();
const mongoose = require("mongoose");
const Location = require("../models/Location");

const locations = [
  { name: "Indiranagar", latitude: 12.9719, longitude: 77.6412 },
  { name: "Koramangala", latitude: 12.9352, longitude: 77.6245 },
  { name: "Whitefield", latitude: 12.9698, longitude: 77.7499 },
  { name: "MG Road", latitude: 12.9756, longitude: 77.6046 },
  { name: "Electronic City", latitude: 12.8399, longitude: 77.6770 },
  { name: "Hebbal", latitude: 13.0358, longitude: 77.5970 },
  { name: "Jayanagar", latitude: 12.9250, longitude: 77.5938 },
  { name: "BTM Layout", latitude: 12.9166, longitude: 77.6101 },
  { name: "Marathahalli", latitude: 12.9591, longitude: 77.6974 },
  { name: "Rajajinagar", latitude: 12.9916, longitude: 77.5533 },
  { name: "Banashankari", latitude: 12.9255, longitude: 77.5468 },
  { name: "Malleshwaram", latitude: 13.0035, longitude: 77.5700 },
  { name: "HSR Layout", latitude: 12.9116, longitude: 77.6474 },
  { name: "Yelahanka", latitude: 13.1007, longitude: 77.5963 },
  { name: "KR Puram", latitude: 12.9982, longitude: 77.6954 },
  { name: "Sarjapur", latitude: 12.9141, longitude: 77.6818 },
  { name: "Bellandur", latitude: 12.9279, longitude: 77.6762 },
  { name: "Kalyan Nagar", latitude: 13.0223, longitude: 77.6408 },
  { name: "Ulsoor", latitude: 12.9791, longitude: 77.6208 },
  { name: "Peenya", latitude: 13.0285, longitude: 77.5196 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Location.deleteMany({});
    await Location.insertMany(locations);

    console.log("Bangalore locations seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();