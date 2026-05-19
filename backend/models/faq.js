const mongoose = require("mongoose");

// ======= FAQ Model =======
const faqSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Policies", "Payment", "Shipping", "Photographers", "Technical", "Booking", "General"],
    default: "General"
  },
  question: {
    type: String,
    required: true,
    unique: true
  },
  answer: {
    type: String,
    required: true
  },
  keywords: [String], // For matching user queries
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
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

module.exports = mongoose.model("FAQ", faqSchema);
