const mongoose = require("mongoose");

// ======= Coupon Model =======
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: String,
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: Number, // Maximum discount amount (for percentage)
  minOrderValue: {
    type: Number,
    default: 0 // Minimum order value to apply coupon
  },
  maxUses: {
    type: Number,
    default: null // null = unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  applicablePhotographers: [String], // If empty, applies to all
  applicableEventTypes: [String], // If empty, applies to all
  expiryDate: Date,
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

couponSchema.methods.isValid = function() {
  return (
    this.active &&
    (!this.expiryDate || this.expiryDate > new Date()) &&
    (!this.maxUses || this.usedCount < this.maxUses)
  );
};

couponSchema.methods.calculateDiscount = function(totalAmount) {
  if (totalAmount < this.minOrderValue) {
    return 0;
  }

  if (this.discountType === "percentage") {
    const discount = (totalAmount * this.discountValue) / 100;
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  } else {
    return Math.min(this.discountValue, totalAmount);
  }
};

module.exports = mongoose.model("Coupon", couponSchema);
