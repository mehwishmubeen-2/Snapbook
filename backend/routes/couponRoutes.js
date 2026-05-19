const express = require("express");
const router = express.Router();
const Coupon = require("../models/coupon");
const { protect } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/checkPermission");

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Validate coupon
router.post("/validate", protect, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!coupon || !coupon.isValid()) {
      return res.json({ success: false, message: "Invalid or expired coupon" });
    }

    if (orderTotal < coupon.minOrderValue) {
      return res.json({
        success: false,
        message: `Minimum order value is Rs. ${coupon.minOrderValue}/-`
      });
    }

    const discount = coupon.calculateDiscount(orderTotal);
    const newTotal = Math.max(0, orderTotal - discount);

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount,
        newTotal,
        message: `Saved Rs. ${discount}/-!`
      }
    });
  } catch (err) {
    console.error("[COUPON VALIDATE ERROR]", err);
    res.status(500).json({ success: false, message: "Error validating coupon" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Get all coupons
router.get("/", protect, checkPermission("managePayments"), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching coupons" });
  }
});

// Create coupon
router.post("/", protect, checkPermission("managePayments"), async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      maxUses,
      expiryDate,
      active
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue: minOrderValue || 0,
      maxUses,
      expiryDate,
      active: active !== false
    });

    await coupon.save();

    console.log("[COUPON] New coupon created:", code);
    res.json({ success: true, coupon });
  } catch (err) {
    console.error("[COUPON CREATE ERROR]", err);
    res.status(500).json({ success: false, message: "Error creating coupon" });
  }
});

// Update coupon
router.put("/:id", protect, checkPermission("managePayments"), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    console.log("[COUPON] Coupon updated:", coupon.code);
    res.json({ success: true, coupon });
  } catch (err) {
    console.error("[COUPON UPDATE ERROR]", err);
    res.status(500).json({ success: false, message: "Error updating coupon" });
  }
});

// Delete coupon
router.delete("/:id", protect, checkPermission("managePayments"), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    console.log("[COUPON] Coupon deleted:", coupon.code);
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting coupon" });
  }
});

module.exports = router;
