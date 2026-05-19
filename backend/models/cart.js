const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  items: [
    {
      photographerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      eventDate: {
        type: Date,
        required: true
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
      totalPrice: {
        type: Number,
        required: true
      },
      notes: {
        type: String
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  totalCost: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },
  lastReminderSent: {
    type: Date,
    default: null
  },
  reminderCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
