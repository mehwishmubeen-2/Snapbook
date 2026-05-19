const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  photographerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  eventDate: Date,
  eventLocation: String,
  packageSelected: String,
  totalAmount: Number,
  bookingStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);