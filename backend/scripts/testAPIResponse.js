require("dotenv").config();
const mongoose = require("mongoose");
const PhotographerProfile = require("../models/photographerProfile");
const User = require("../models/user");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n🔍 TESTING API RESPONSE:\n");

    // Simulate what the API does
    const filter = { isPublished: true };
    
    console.log("1️⃣  Finding photographers with filter:", JSON.stringify(filter));
    const photographers = await PhotographerProfile.find(filter)
      .populate("userId", "name email profileImage")
      .sort({ rating: -1 })
      .skip(0)
      .limit(10);

    console.log(`\n2️⃣  Found ${photographers.length} photographers from database\n`);

    // Simulate the formatting that happens in the controller
    const formattedPhotographers = photographers
      .filter(p => {
        const hasUserId = p.userId?._id || p.userId;
        if (!hasUserId) {
          console.log(`   ❌ FILTERED OUT: ${p._id} - no valid userId`);
        }
        return hasUserId;
      })
      .map(p => {
        const userId = p.userId?._id || p.userId;
        return {
          _id: p._id,
          userId: userId,
          name: p.userId?.name || "Photographer",
          email: p.userId?.email,
          profileImage: p.userId?.profileImage,
          bio: p.bio,
          experience: p.experience,
          city: p.city,
          specialization: p.specialization,
          eventTypes: p.eventTypes,
          pricePerHour: p.pricePerHour,
          rating: p.rating,
          totalReviews: p.totalReviews,
          serviceHighlights: p.serviceHighlights || [],
          slug: p.slug,
          isPublished: p.isPublished
        };
      });

    console.log(`3️⃣  After filtering: ${formattedPhotographers.length} photographers returned\n`);
    
    console.log("📊 API RESPONSE DATA:\n");
    formattedPhotographers.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   - Price: Rs. ${p.pricePerHour}/hr`);
      console.log(`   - City: ${p.city}`);
      console.log(`   - Specialization: ${p.specialization}`);
      console.log(`   - userId: ${p.userId}`);
      console.log();
    });

    console.log("=".repeat(50));
    console.log(`✅ FINAL COUNT: ${formattedPhotographers.length} photographers`);
    console.log("=".repeat(50) + "\n");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
