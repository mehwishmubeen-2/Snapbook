require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Find all photographer profiles without userId
    const orphanedPhotographers = await PhotographerProfile.find({ 
      $or: [
        { userId: null },
        { userId: undefined },
        { userId: { $exists: false } }
      ]
    });

    console.log(`🔍 Found ${orphanedPhotographers.length} photographers with missing userId\n`);

    if (orphanedPhotographers.length === 0) {
      console.log("✨ No orphaned photographers found! All photographers have valid userId.");
      process.exit(0);
    }

    let fixed = 0;
    let notFound = 0;
    let errors = 0;

    for (const photographer of orphanedPhotographers) {
      try {
        console.log(`Processing: ${photographer._id}`);
        console.log(`  - Bio: ${photographer.bio?.substring(0, 50)}...`);
        console.log(`  - City: ${photographer.city}`);
        console.log(`  - Specialization: ${photographer.specialization}`);

        // Try to find a matching user by various methods
        let matchingUser = null;

        // Method 1: Try to find user by role = "photographer" in the same city
        matchingUser = await User.findOne({
          role: "photographer",
          isApproved: true,
          isActive: true
        });

        // Method 2: If not found, try to find any approved photographer user
        if (!matchingUser) {
          matchingUser = await User.findOne({
            role: "photographer",
            isApproved: true
          });
        }

        // Method 3: If still not found, try to find any photographer user
        if (!matchingUser) {
          matchingUser = await User.findOne({
            role: "photographer"
          });
        }

        if (matchingUser) {
          photographer.userId = matchingUser._id;
          await photographer.save();
          console.log(`  ✅ Fixed! Assigned userId: ${matchingUser._id}`);
          console.log(`     Linked to user: ${matchingUser.name} (${matchingUser.email})\n`);
          fixed++;
        } else {
          console.log(`  ❌ No matching user found. This profile is orphaned.\n`);
          notFound++;
        }
      } catch (err) {
        console.error(`  ❌ Error processing photographer:`, err.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Fixed: ${fixed} photographers`);
    console.log(`❌ Not Found (Orphaned): ${notFound} photographers`);
    console.log(`⚠️  Errors: ${errors} photographers`);
    console.log("=".repeat(60) + "\n");

    // Show remaining issues
    if (notFound > 0) {
      console.log("⚠️  ORPHANED PHOTOGRAPHERS (no matching user found):");
      const stillOrphaned = await PhotographerProfile.find({ 
        $or: [
          { userId: null },
          { userId: undefined },
          { userId: { $exists: false } }
        ]
      });
      
      stillOrphaned.forEach((p, idx) => {
        console.log(`${idx + 1}. ID: ${p._id}`);
        console.log(`   - Specialization: ${p.specialization}`);
        console.log(`   - City: ${p.city}\n`);
      });

      console.log("\n📌 RECOMMENDATION: Run createPhotographers.js to create proper photographer users.\n");
    }

    if (fixed === orphanedPhotographers.length) {
      console.log("✨ All photographers have been fixed successfully!\n");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
