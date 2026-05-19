const mongoose = require("mongoose");

// ======= User Behavior/Analytics Model =======
const analyticSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  photographerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PhotographerProfile",
    index: true
  },
  action: {
    type: String,
    enum: ["view", "click", "add_to_cart", "wishlist_add", "booking_completed", "review_left"],
    required: true,
    index: true
  },
  eventType: String,
  referrer: String, // Where they came from
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for efficient queries
analyticSchema.index({ timestamp: -1 });
analyticSchema.index({ photographerId: 1, timestamp: -1 });
analyticSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model("Analytic", analyticSchema);
