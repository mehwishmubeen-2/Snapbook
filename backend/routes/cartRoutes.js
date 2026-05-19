const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// All routes require authentication
router.use(protect);

// Get cart
router.get("/", cartController.getCart);

// Add to cart
router.post("/add", cartController.addToCart);

// Remove from cart
router.delete("/remove/:itemId", cartController.removeFromCart);

// Update cart item
router.patch("/update/:itemId", cartController.updateCartItem);

// Clear cart
router.delete("/clear", cartController.clearCart);

module.exports = router;
