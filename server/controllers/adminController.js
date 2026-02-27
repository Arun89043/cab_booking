const User = require("../models/User");
const Ride = require("../models/Ride");
const Promo = require("../models/Promo");

/* ===============================
   GET ALL USERS
================================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   BLOCK / UNBLOCK USER
================================= */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "blocked"} successfully`,
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET ALL RIDES
================================= */
exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("rider", "name email")
      .populate("driver", "name email");

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   ADMIN DASHBOARD
================================= */
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: "DRIVER" });
    const totalRiders = await User.countDocuments({ role: "RIDER" });
    const totalRides = await Ride.countDocuments();

    const paidRides = await Ride.find({ paymentStatus: "PAID" });

    const totalRevenue = paidRides.reduce(
      (sum, ride) => sum + (ride.finalFare || ride.fare),
      0
    );

    res.json({
      totalUsers,
      totalDrivers,
      totalRiders,
      totalRides,
      totalRevenue,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};