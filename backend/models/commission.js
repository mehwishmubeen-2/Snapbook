const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({
  photographerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },
  totalAmount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    default: 0 // e.g., 15% of total
  },
  photographerEarning: {
    type: Number,
    required: true
  },
  payoutStatus: {
    type: String,
    enum: ["pending", "processed", "paid"],
    default: "pending"
  },
  payoutDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("Commission", commissionSchema);
