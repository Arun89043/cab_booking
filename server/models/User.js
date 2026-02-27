const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["RIDER", "DRIVER", "ADMIN"],
      default: "RIDER",
    },
    isOnline: {
  type: Boolean,
  default: false
},
    averageRating: {
  type: Number,
  default: 0,
},

totalRatings: {
  type: Number,
  default: 0,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);