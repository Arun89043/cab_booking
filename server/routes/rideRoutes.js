const express = require("express");
const protect = require("../middlewares/authMiddleware");

const {
  createRide,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  payRide, 
  getRideHistory,
  getDriverEarnings,
  getAvailableRides,
  getDriverDashboard,
  rateRide,
  getRideById,
  applyPromo
} = require("../controllers/rideController");

const router = express.Router();
console.log({
  createRide,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  payRide,
  getRideHistory,
  getDriverEarnings,
  getAvailableRides,
  getDriverDashboard,
  rateRide,
  getRideById,
  applyPromo
});
/* ===============================
   PROMO
================================= */
router.post("/apply-promo", protect, applyPromo);

/* ===============================
   CREATE RIDE (RIDER)
================================= */
router.post("/create", protect, createRide);

/* ===============================
   ACCEPT RIDE (DRIVER)
================================= */
router.put("/accept/:id", protect, acceptRide);

/* ===============================
   START RIDE (DRIVER)
================================= */
router.put("/start/:id", protect, startRide);

/* ===============================
   COMPLETE RIDE (DRIVER)
================================= */
router.put("/complete/:id", protect, completeRide);

/* ===============================
   CANCEL RIDE (RIDER)
================================= */
router.put("/cancel/:id", protect, cancelRide);

/* ===============================
   COMPLETE PAYMENT (RIDER)
================================= */
router.put("/pay/:id", protect, payRide);

/* ===============================
   RATE RIDE (RIDER)
================================= */
router.put("/rate/:id", protect, rateRide);

/* ===============================
   RIDE HISTORY
================================= */
router.get("/history", protect, getRideHistory);

/* ===============================
   DRIVER DASHBOARD
================================= */
router.get("/drivers/dashboard", protect, getDriverDashboard);

/* ===============================
   DRIVER EARNINGS
================================= */
router.get("/earnings", protect, getDriverEarnings);

/* ===============================
   AVAILABLE RIDES (DRIVER)
================================= */
router.get("/available", protect, getAvailableRides);
router.get("/:id", protect, getRideById)
module.exports = router;