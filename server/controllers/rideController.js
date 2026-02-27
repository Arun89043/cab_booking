const Ride = require("../models/Ride");
const User = require("../models/User");
const Promo = require("../models/Promo");
/* ===============================
   CREATE RIDE (RIDER ONLY)
================================= */

const calculateSurgeMultiplier = async () => {
  const currentHour = new Date().getHours();

  let surge = 1;
  let reason = null;

  // 🔥 Peak hour surge (6 PM - 10 PM)
  if (currentHour >= 18 && currentHour <= 22) {
    surge = 1.5;
    reason = "Peak hour surge";
  }

  // 🔥 High demand surge (if too many requested rides)
  const activeRequests = await Ride.countDocuments({
    status: "REQUESTED"
  });

  if (activeRequests > 5) {
    surge = 2;
    reason = "High demand surge";
  }

  return { surge, reason };
};

exports.createRide = async (req, res) => {
  try {
    const { pickupAddress, dropAddress, fare, stops = [] } = req.body;

    // Basic validation
    if (!pickupAddress || !dropAddress || !fare) {
      return res.status(400).json({
        message: "Pickup, drop and base fare are required",
      });
    }

    if (req.user.role !== "RIDER") {
      return res.status(403).json({
        message: "Only riders can book rides",
      });
    }

    const baseFare = Number(fare);

    if (isNaN(baseFare) || baseFare <= 0) {
      return res.status(400).json({
        message: "Fare must be a valid positive number",
      });
    }

    // Stop validation
    if (!Array.isArray(stops)) {
      return res.status(400).json({
        message: "Stops must be an array",
      });
    }

    if (stops.length > 5) {
      return res.status(400).json({
        message: "Maximum 5 stops allowed",
      });
    }

    const STOP_CHARGE = 50; // configurable later

    const stopChargeTotal = stops.length * STOP_CHARGE;
    const totalFare = baseFare + stopChargeTotal;
    const { surge, reason } = await calculateSurgeMultiplier();

const surgedFare = totalFare * surge;
     console.log("Stops length:", stops.length);
console.log("Calculated totalFare:", totalFare);

    const ride = await Ride.create({
  rider: req.user.id,
  pickupAddress,
  dropAddress,
  stops,
  fare: surgedFare,
  finalFare: surgedFare,
  surgeMultiplier: surge,
  surgeReason: reason,
  status: "REQUESTED",
  paymentStatus: "PENDING",
});

    const io = req.app.get("io");
    if (io) {
      io.emit("rideRequested", ride);
    }

    res.status(201).json({
  message: "Ride requested successfully",
  baseFare,
  stopCharge: stopChargeTotal,
  surgeMultiplier: surge,
  surgeReason: reason,
  totalFareBeforeSurge: totalFare,
  finalFare: surgedFare,
  ride,
});

  } catch (error) {
    console.error("Create Ride Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   ACCEPT RIDE (DRIVER ONLY)
================================= */
exports.acceptRide = async (req, res) => {
  try {
    if (req.user.role !== "DRIVER") {
      return res.status(403).json({
        message: "Only drivers can accept rides",
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "REQUESTED") {
      return res.status(400).json({
        message: "Ride already accepted or completed",
      });
    }

    ride.driver = req.user.id;
    ride.status = "ACCEPTED";

    await ride.save();

    res.status(200).json({
      message: "Ride accepted successfully",
      ride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   START RIDE
================================= */
exports.startRide = async (req, res) => {
  try {
    if (req.user.role !== "DRIVER") {
      return res.status(403).json({
        message: "Only drivers can start rides",
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "ACCEPTED") {
      return res.status(400).json({
        message: "Ride must be ACCEPTED before starting",
      });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not assigned to this ride",
      });
    }

    ride.status = "STARTED";
    await ride.save();

    res.status(200).json({
      message: "Ride started successfully",
      ride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  ride.startedAt = new Date();
};

/* ===============================
   COMPLETE RIDE
================================= */
exports.completeRide = async (req, res) => {
  try {
    if (req.user.role !== "DRIVER") {
      return res.status(403).json({
        message: "Only drivers can complete rides",
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "STARTED") {
      return res.status(400).json({
        message: "Ride must be started before completing",
      });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not assigned to this ride",
      });
    }

    // ✅ NOW update after fetching ride
    ride.status = "COMPLETED";
    ride.completedAt = new Date();
    ride.paymentStatus = "PENDING";

    // Example commission logic
const platformCommission = 0.20; // 20%
ride.driverEarning = ride.finalFare * (1 - platformCommission);

    await ride.save();

    res.status(200).json({
      message: "Ride completed successfully",
      ride,
    });

  } catch (error) {
    console.error("Complete Ride Error:", error);
    res.status(500).json({ message: error.message });
  }
};
/* ===============================
   CANCEL RIDE (RIDER ONLY)
================================= */
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.rider.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only cancel your own ride",
      });
    }

    if (
      ride.status !== "REQUESTED" &&
      ride.status !== "ACCEPTED"
    ) {
      return res.status(400).json({
        message: "Ride cannot be cancelled at this stage",
      });
    }

    ride.status = "CANCELLED";
    await ride.save();

    res.status(200).json({
      message: "Ride cancelled successfully",
      ride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   COMPLETE PAYMENT (RIDER ONLY)
================================= */
// exports.completePayment = async (req, res) => {
//   try {
//     const ride = await Ride.findById(req.params.id);

//     if (!ride) {
//       return res.status(404).json({ message: "Ride not found" });
//     }

//     if (ride.rider.toString() !== req.user.id) {
//       return res.status(403).json({
//         message: "You can only pay for your own ride",
//       });
//     }

//     if (ride.status !== "COMPLETED") {
//       return res.status(400).json({
//         message: "Ride must be completed before payment",
//       });
//     }

//     if (ride.paymentStatus === "PAID") {
//       return res.status(400).json({
//         message: "Ride already paid",
//       });
//     }

//     // Use finalFare if available
//     const payableAmount = ride.finalFare || ride.fare;

//     // 20% commission
//     const driverEarning = payableAmount * 0.8;

//     ride.paymentStatus = "PAID";
//     ride.paidAt = new Date();
//     ride.driverEarning = driverEarning;

//     await ride.save();

//     // Update promo usage after payment
//     if (ride.promoCode) {
//       const promo = await Promo.findOne({ code: ride.promoCode });
//       if (promo) {
//         promo.usedCount += 1;
//         await promo.save();
//       }
//     }

//     res.status(200).json({
//       message: "Payment completed successfully",
//       paidAmount: payableAmount,
//       driverEarning,
//       ride,
//     });

//   } catch (error) {
//     console.error("Payment Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

/* ===============================
   GET RIDE HISTORY
================================= */
exports.getRideHistory = async (req, res) => {
  try {
    let rides = [];

    if (req.user.role === "RIDER") {
      rides = await Ride.find({ rider: req.user.id })
        .sort({ createdAt: -1 });
    }

    if (req.user.role === "DRIVER") {
      rides = await Ride.find({ driver: req.user.id })
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      count: rides.length,
      rides,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   DRIVER EARNINGS
================================= */
exports.getDriverEarnings = async (req, res) => {
  try {
    if (req.user.role !== "DRIVER") {
      return res.status(403).json({
        message: "Only drivers can view earnings",
      });
    }

    const rides = await Ride.find({
      driver: req.user.id,
      status: "COMPLETED",
      paymentStatus: "PAID",
    });

    const totalRides = rides.length;

    const totalEarnings = rides.reduce(
      (sum, ride) => sum + ride.driverEarning,
      0
    );

    res.status(200).json({
      totalRides,
      totalEarnings,
      rides,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   AVAILABLE RIDES (DRIVER ONLY)
================================= */
// 🚘 GET AVAILABLE RIDES (ONLINE DRIVERS ONLY)
exports.getAvailableRides = async (req, res) => {
  try {
    if (req.user.role !== "DRIVER") {
      return res.status(403).json({ message: "Only drivers allowed" });
    }

    const rides = await Ride.find({
      status: "REQUESTED",
      driver: null
    }).populate("rider", "name email");

    res.status(200).json({
      success: true,
      count: rides.length,
      rides
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// ⭐ RATE RIDE (RIDER ONLY)
exports.payRide = async (req, res) => {
  try {
    if (req.user.role !== "RIDER") {
      return res.status(403).json({
        message: "Only riders can pay for rides",
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    if (ride.rider.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (ride.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Ride must be completed before payment",
      });
    }

    if (ride.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "Ride already paid",
      });
    }

    // Commission logic
    const platformCommission = 0.20;
    const payableAmount = ride.finalFare || ride.fare;
    const driverEarning = payableAmount * (1 - platformCommission);

    ride.paymentStatus = "PAID";
    ride.paidAt = new Date();
    ride.driverEarning = driverEarning;

    await ride.save();

    res.status(200).json({
      message: "Payment successful",
      ride,
    });

  } catch (error) {
    console.error("Pay Ride Error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// 🚘 DRIVER DASHBOARD SUMMARY
exports.getDriverDashboard = async (req, res) => {
  try {
    // Only DRIVER can access
    if (req.user.role !== "DRIVER") {
      return res.status(403).json({
        message: "Only drivers can access dashboard"
      });
    }

    const driverId = req.user.id;

    const allRides = await Ride.find({ driver: driverId });

    const totalRides = allRides.length;

    const completedRides = allRides.filter(
      ride => ride.status === "COMPLETED"
    ).length;

    const paidRides = allRides.filter(
      ride => ride.paymentStatus === "PAID"
    );

    const totalEarnings = paidRides.reduce(
      (sum, ride) => sum + (ride.driverEarning || 0),
      0
    );

    const driver = await User.findById(driverId);

    res.status(200).json({
      totalRides,
      completedRides,
      totalEarnings,
      averageRating: driver.averageRating,
      totalRatings: driver.totalRatings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.applyPromo = async (req, res) => {
  try {
    const { rideId, code } = req.body;

    if (!rideId || !code) {
      return res.status(400).json({ message: "Ride ID and promo code required" });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Ensure user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only rider who created ride can apply promo
    if (ride.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized for this ride" });
    }

    // Cannot apply after payment
    if (ride.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "Cannot apply promo after payment",
      });
    }

    // Prevent double promo
    if (ride.promoCode) {
      return res.status(400).json({
        message: "Promo already applied",
      });
    }

    const promo = await Promo.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promo) {
      return res.status(400).json({ message: "Invalid promo code" });
    }

    // Expiry check
    if (promo.expiryDate && promo.expiryDate < new Date()) {
      return res.status(400).json({ message: "Promo expired" });
    }

    // Usage limit check
    if (promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ message: "Promo limit reached" });
    }

    // Minimum ride amount check
    if (ride.fare < promo.minRideAmount) {
      return res.status(400).json({
        message: "Ride amount too low for this promo",
      });
    }

    let discount = 0;

    if (promo.discountType === "PERCENT") {
      discount = (ride.fare * promo.discountValue) / 100;

      if (promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount);
      }
    } else {
      discount = promo.discountValue;
    }

    discount = Math.min(discount, ride.fare);

    ride.promoCode = promo.code;
    ride.discountAmount = discount;
    ride.finalFare = ride.fare - discount;

    await ride.save();

    res.status(200).json({
      message: "Promo applied successfully",
      discount,
      finalFare: ride.finalFare,
    });

  } catch (error) {
    console.error("Apply Promo Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.markArrived = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" })
    }

    ride.status = "ARRIVED"
    await ride.save()

    res.json({ message: "Driver arrived", ride })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.payRide = async (req, res) => {
  try {
    if (req.user.role !== "RIDER") {
      return res.status(403).json({
        message: "Only riders can pay for rides",
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    if (ride.rider.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to pay for this ride",
      });
    }

    if (ride.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Ride must be completed before payment",
      });
    }

    if (ride.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "Ride already paid",
      });
    }

    // ✅ Update payment info
    ride.paymentStatus = "PAID";
    ride.paidAt = new Date();

    await ride.save();

    res.status(200).json({
      message: "Payment successful",
      ride,
    });

  } catch (error) {
    console.error("Pay Ride Error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.status(200).json({ ride });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { rating } = req.body;

    ride.rating = rating;
    await ride.save();

    res.status(200).json({
      message: "Ride rated successfully",
      ride,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};