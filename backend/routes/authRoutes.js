const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.registerValidation, authController.register);
router.post("/login", authController.login);

// Example protected route for testing
router.get("/me", protect, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});

// Example admin-only route
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Hello Admin" });
});

module.exports = router;
