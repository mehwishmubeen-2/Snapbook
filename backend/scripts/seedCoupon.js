// ══════════════════════════════════════════════════════════════════════════════
// SEED COUPON DATA
// ══════════════════════════════════════════════════════════════════════════════
// Run: node seedCoupon.js

const mongoose = require("mongoose");
require("../config/db");
const Coupon = require("../models/coupon");

const couponData = [
  {
    code: "SAVE10",
    discountType: "percentage",
    discountValue: 10,
    maxUses: 100,
    minOrderValue: 2000,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    active: true,
    description: "Get 10% off on any booking"
  },
  {
    code: "FLAT500",
    discountType: "fixed",
    discountValue: 500,
    maxUses: 50,
    minOrderValue: 3000,
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    active: true,
    description: "Rs. 500 off on bookings above Rs. 3000"
  },
  {
    code: "FIRSTBOOK",
    discountType: "percentage",
    discountValue: 15,
    maxUses: 500,
    minOrderValue: 1000,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    active: true,
    description: "15% off on your first booking"
  },
  {
    code: "FAMILY20",
    discountType: "percentage",
    discountValue: 20,
    maxUses: 100,
    minOrderValue: 5000,
    expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
    active: true,
    description: "20% off on family packages"
  },
  {
    code: "SUMMER2024",
    discountType: "percentage",
    discountValue: 12,
    maxUses: 200,
    minOrderValue: 2500,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    active: true,
    description: "Summer special - 12% discount on all bookings"
  },
  {
    code: "WEDDING500",
    discountType: "fixed",
    discountValue: 1000,
    maxUses: 30,
    minOrderValue: 10000,
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
    active: true,
    description: "Rs. 1000 off on wedding photography packages"
  },
  {
    code: "INVITE100",
    discountType: "fixed",
    discountValue: 100,
    maxUses: 999,
    minOrderValue: 1500,
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    active: true,
    description: "Rs. 100 off - Loyalty coupon for existing users"
  },
  {
    code: "EXPIRED",
    discountType: "percentage",
    discountValue: 5,
    maxUses: 0,
    minOrderValue: 2000,
    expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired 1 day ago
    active: false,
    description: "This coupon has expired (for testing)"
  }
];

async function seedCouponData() {
  try {
    console.log("Connecting to database...");
    
    // Clear existing coupons
    const deleteResult = await Coupon.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing coupons`);

    // Insert new coupons
    const result = await Coupon.insertMany(couponData);
    console.log(`✅ Successfully seeded ${result.length} coupons\n`);

    // Display seeded data
    console.log("📋 Seeded Coupons:\n");
    result.forEach(coupon => {
      const status = coupon.active ? "✅ ACTIVE" : "❌ INACTIVE";
      let discountStr;
      if (coupon.discountType === "percentage") {
        discountStr = `${coupon.discountValue}% off`;
      } else {
        discountStr = `Rs. ${coupon.discountValue} off`;
      }
      
      console.log(`  ${status} | ${coupon.code}`);
      console.log(`    → ${discountStr} (Min: Rs. ${coupon.minOrderValue})`);
      console.log(`    → Used: ${coupon.usedCount || 0}/${coupon.maxUses} | Expires: ${coupon.expiryDate.toLocaleDateString()}`);
      console.log("");
    });

    console.log("✨ Coupon Seeding Complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding coupons:", err.message);
    process.exit(1);
  }
}

seedCouponData();
