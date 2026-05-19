const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  photographerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  // SEO fields for individual portfolio item pages
  slug: {
    type: String,
    index: true,
    unique: false
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String]
}, { timestamps: true }); // adds createdAt & updatedAt automatically

module.exports = mongoose.model("Portfolio", portfolioSchema);