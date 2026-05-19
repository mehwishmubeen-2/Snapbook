const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

// All routes require authentication
router.use(protect);

// Get all orders for logged-in customer
router.get("/", orderController.getOrders);

// Get all orders where logged-in user is the photographer
router.get("/photographer", orderController.getPhotographerOrders);

// Photographer updates order status (accept / decline / schedule)
router.patch("/:orderId/status", orderController.updateOrderStatus);

// Get order details
router.get("/:orderId", orderController.getOrderDetails);

// Get order tracking info
router.get("/:orderId/tracking", orderController.getOrderTracking);

// Create order from cart
router.post("/create-from-cart", orderController.createOrder);

// Create direct order
router.post("/create-direct", orderController.createDirectOrder);

// Cancel order
router.patch("/:orderId/cancel", orderController.cancelOrder);

// Mark order as paid
router.patch("/:orderId/mark-paid", orderController.markAsPaid);

// Customer marks session as completed (unlocks review)
router.patch("/:orderId/complete", orderController.markAsCompleted);

module.exports = router;
