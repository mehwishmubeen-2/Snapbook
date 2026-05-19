const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ["customer", "photographer", "admin"],
    default: "customer"
  },
  // for photographer/admin dashboards, etc.
  profileImage: { type: String },
  // optional SEO slug for public profile URLs (e.g. /photographers/john-doe)
  slug: {
    type: String,
    index: true,
    unique: false
  },
  // photographers must be approved by admin before they can work/login fully
  isApproved: {
    type: Boolean,
    default: false
  },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [{ type: String }],
  // Admin-specific fields
  adminPermissions: {
    managePhotographers: { type: Boolean, default: false },
    manageBookings: { type: Boolean, default: false },
    managePayments: { type: Boolean, default: false },
    manageReviews: { type: Boolean, default: false },
    manageUsers: { type: Boolean, default: false },
    viewAnalytics: { type: Boolean, default: false },
    handleDisputes: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true }); // automatically adds createdAt & updatedAt

// Additional query-performance indexes
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);