const mongoose = require("mongoose");

// ======= Order Timeline Model =======
const orderTimelineSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "payment_received", "photographer_accepted", "session_scheduled", "completed", "cancelled"],
    required: true
  },
  message: String,
  changedBy: {
    type: String,
    enum: ["system", "admin", "customer", "photographer"],
    default: "system"
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
orderTimelineSchema.index({ orderId: 1, timestamp: 1 });

module.exports = mongoose.model("OrderTimeline", orderTimelineSchema);
