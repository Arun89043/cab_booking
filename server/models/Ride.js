const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    pickupAddress: {
      type: String,
      required: true,
    },

    dropAddress: {
      type: String,
      required: true,
    },

    // 🔥 Multi-Stop Support
    stops: [
      {
        address: {
          type: String,
        },
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        },
      },
    ],

    fare: {
      type: Number,
      required: true,
    },

    promoCode: {
      type: String,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalFare: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["REQUESTED", "ACCEPTED", "STARTED", "COMPLETED", "CANCELLED"],
      default: "REQUESTED",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    driverEarning: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
    },

    ratedAt: {
      type: Date,
    },
    surgeMultiplier: {
  type: Number,
  default: 1,
},

surgeReason: {
  type: String,
},
  },
  {
  driverArrivedAt: Date,
startedAt: Date,
completedAt: Date,
paidAt: Date,
  },
  {
    timestamps: true,
  }
  
);

module.exports = mongoose.model("Ride", rideSchema);