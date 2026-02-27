const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  discountType: { type: String, enum: ["PERCENT", "FLAT"], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number }, // only for percentage
  minRideAmount: { type: Number, default: 0 },
  expiryDate: { type: Date },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Promo", promoSchema);