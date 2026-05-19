const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    photographerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      required: true,
    },
    price: {
      type: Number,
      required: true, // in PKR
    },
    duration: {
      type: Number,
      required: true, // in hours
    },
    features: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
