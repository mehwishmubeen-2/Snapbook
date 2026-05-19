const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

// GET /api/reviews/my-reviews — customer: get all orders they've reviewed
router.get("/my-reviews", protect, authorizeRoles("customer"), reviewController.getMyReviews);

// POST /api/reviews — JWT protected, customer only
router.post("/", protect, authorizeRoles("customer"), reviewController.createReview);

// GET /api/reviews/:photographerId — public
router.get("/:photographerId", reviewController.getReviews);

// DELETE /api/reviews/:id — JWT protected, admin only
router.delete("/:id", protect, authorizeRoles("admin"), reviewController.deleteReview);

module.exports = router;
