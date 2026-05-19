const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const wishlistController = require("../controllers/wishlistController");

// All routes require authentication
router.use(protect);

// Get wishlist
router.get("/", wishlistController.getWishlist);

// Add to wishlist
router.post("/add", wishlistController.addToWishlist);

// Remove from wishlist
router.delete("/remove/:photographerId", wishlistController.removeFromWishlist);

// Clear wishlist
router.delete("/clear", wishlistController.clearWishlist);

module.exports = router;
