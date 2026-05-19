/**
 * One-time migration: set seoStatus = 'none' on all photographer profiles
 * that were created before the seoStatus field was introduced.
 * Run once: node scripts/fixSeoStatus.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const PhotographerProfile = require("../models/photographerProfile");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const result = await PhotographerProfile.updateMany(
      { seoStatus: { $exists: false } },
      { $set: { seoStatus: "none" } }
    );

    console.log(`✅ Fixed ${result.modifiedCount} profiles (seoStatus set to 'none')`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
})();
