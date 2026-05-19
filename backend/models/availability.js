const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    photographerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workingDays: {
      type: [
        {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      ],
      default: [],
    },
    workingHours: {
      start: { type: String, default: "09:00" }, // e.g. '09:00'
      end: { type: String, default: "18:00" },   // e.g. '18:00'
    },
    blockedDates: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
