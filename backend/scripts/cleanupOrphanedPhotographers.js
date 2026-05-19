require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Find all photographer profiles
    const allPhotographers = await PhotographerProfile.find({});
    
    console.log(`📊 Total photographer profiles: ${allPhotographers.length}\n`);

    // Find photographers with broken userId references (populate returns null)
    const orphanedPhotographers = [];
    
    for (const photographer of allPhotographers) {
      // Check if the userId reference exists in User collection
      const user = await User.findById(photographer.userId);
      
      if (!user) {
        orphanedPhotographers.push(photographer);
      }
    }

    console.log(`🔍 Found ${orphanedPhotographers.length} orphaned photographers (broken userId references)\n`);

    if (orphanedPhotographers.length === 0) {
      console.log("✨ No orphaned photographers found!\n");
      process.exit(0);
    }

    // Display orphaned photographers
    console.log("Orphaned Photographers to be deleted:");
    console.log("=".repeat(60));
    orphanedPhotographers.forEach((p, idx) => {
      console.log(`${idx + 1}. ID: ${p._id}`);
      console.log(`   Referenced userId: ${p.userId}`);
      console.log(`   Specialization: ${p.specialization}`);
      console.log(`   City: ${p.city}`);
      console.log(`   Created: ${p.createdAt}`);
      console.log();
    });

    // Delete orphaned photographers
    console.log("=".repeat(60));
    const idsToDelete = orphanedPhotographers.map(p => p._id);
    const result = await PhotographerProfile.deleteMany({ _id: { $in: idsToDelete } });

    console.log(`\n✅ Deleted ${result.deletedCount} orphaned photographer profiles\n`);

    // Verify deletion
    const remaining = [];
    const checkPhotographers = await PhotographerProfile.find({});
    for (const photographer of checkPhotographers) {
      const user = await User.findById(photographer.userId);
      if (!user) {
        remaining.push(photographer);
      }
    }

    console.log(`📊 Remaining photographers with broken userId references: ${remaining.length}`);

    if (remaining.length === 0) {
      console.log("✨ All orphaned photographers have been removed!");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
