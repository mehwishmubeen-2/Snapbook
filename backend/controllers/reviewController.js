const Review = require("../models/review");
const Booking = require("../models/booking");
const Order = require("../models/order");
const PhotographerProfile = require("../models/photographerProfile");
const mongoose = require("mongoose");

// Recalculate and persist rating + totalReviews on the photographer's profile
async function recalculateRating(photographerId) {
  const result = await Review.aggregate([
    { $match: { photographerId: photographerId } },
    {
      $group: {
        _id: "$photographerId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
  const totalReviews = result.length > 0 ? result[0].totalReviews : 0;

  await PhotographerProfile.findOneAndUpdate(
    { userId: photographerId },
    { $set: { rating: averageRating, totalReviews } }
  );
}

// POST /api/reviews
// Protected — customer only
exports.createReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { bookingId, photographerId, rating, comment } = req.body;

    if (!bookingId || !photographerId || !rating) {
      return res.status(400).json({ success: false, message: "bookingId, photographerId, and rating are required" });
    }

    // Validate rating range
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // 1. Verify a completed Order exists for this customer and photographer
    const order = await Order.findOne({
      _id: bookingId,
      customerId,
      photographerId,
      status: "completed",
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "No completed order found for this photographer. You can only review after a completed session.",
      });
    }

    // 2. Prevent duplicate review for the same order
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already reviewed this booking" });
    }

    // 3. Create the review
    const review = await Review.create({
      bookingId,
      customerId,
      photographerId,
      rating: ratingNum,
      comment: comment ? comment.trim() : "",
    });

    // 4. Recalculate photographer's aggregate rating
    await recalculateRating(review.photographerId);

    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error("createReview error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/reviews/:photographerId
// Public
exports.getReviews = async (req, res) => {
  try {
    const { photographerId } = req.params;

    const reviews = await Review.find({ photographerId })
      .populate("customerId", "name profileImage")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;

    res.json({ success: true, reviews, averageRating, totalReviews });
  } catch (err) {
    console.error("getReviews error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/reviews/my-reviews
// Protected — customer only — returns order IDs the customer has already reviewed
exports.getMyReviews = async (req, res) => {
  try {
    const customerId = req.user.id;
    const reviews = await Review.find({ customerId }).select("bookingId rating comment createdAt photographerId");
    res.json({ success: true, reviews });
  } catch (err) {
    console.error("getMyReviews error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/reviews/:id
// Protected — admin only
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const { photographerId } = review;
    await review.deleteOne();

    // Recalculate rating after deletion
    await recalculateRating(photographerId);

    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
