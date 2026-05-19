const mongoose = require("mongoose");

const photographerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bio: String,
  experience: Number,
  city: String,
  state: String,
  country: String,
  specialization: String,
  eventTypes: [String], // e.g., ["Wedding", "Portrait", "Event", "Corporate"]
  pricePerHour: Number,
  availability: Boolean,
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // SEO fields for photographer profile pages
  slug: {
    type: String,
    index: true,
    unique: false
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  
  // Additional SEO content
  serviceDescription: String, // Detailed service description for SEO
  seoHeading: String, // H1 for SEO
  serviceHighlights: [String], // Key services highlighted
  isPublished: { type: Boolean, default: true },

  // ── SEO approval workflow ──────────────────────────────────────
  // 'none'           → no AI tags generated yet
  // 'pending_review' → AI generated tags waiting for admin to approve
  // 'approved'       → admin has approved; live tags are in metaTitle etc.
  seoStatus: {
    type: String,
    enum: ['none', 'pending_review', 'approved'],
    default: 'none',
    index: true,
  },
  seoGeneratedAt: Date,

  // Pending AI-generated tags (not yet live)
  pendingMetaTitle:       String,
  pendingMetaDescription: String,
  pendingMetaKeywords:    [String],
  pendingSeoHeading:      String,
  pendingSlug:            String,
}, { timestamps: true });

// Query-performance indexes
photographerProfileSchema.index({ userId: 1 }, { unique: true });
photographerProfileSchema.index({ city: 1 });
photographerProfileSchema.index({ eventTypes: 1 });
photographerProfileSchema.index({ rating: -1 });
photographerProfileSchema.index({ pricePerHour: 1 });
photographerProfileSchema.index({ isPublished: 1 });
photographerProfileSchema.index({ isPublished: 1, rating: -1, city: 1 }); // compound for listing page

module.exports = mongoose.model("PhotographerProfile", photographerProfileSchema);