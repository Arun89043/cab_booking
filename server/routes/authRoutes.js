const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");
const User = require("../models/User");
const router = express.Router();
const { toggleDriverStatus } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/toggle-online", protect, toggleDriverStatus);

// 🔥 TEMP ROUTE TO CHECK DRIVER PROFILE


module.exports = router;