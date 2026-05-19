const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  photographerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  eventDate: {
    type: Date,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in hours
    default: 4
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "card"],
    default: "card"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending"
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },
  // Tracking information
  acceptedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  }
}, { timestamps: true });

// Query-performance indexes
orderSchema.index({ status: 1 });
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ photographerId: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);
