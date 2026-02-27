const express = require("express");
const protect = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminMiddleware");

const {
  getAllUsers,
  toggleUserStatus,
  getAllRides,
  getAdminDashboard,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id/toggle", protect, adminOnly, toggleUserStatus);
router.get("/rides", protect, adminOnly, getAllRides);
router.get("/dashboard", protect, adminOnly, getAdminDashboard);

module.exports = router;