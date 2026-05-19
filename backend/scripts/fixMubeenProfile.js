require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n🔧 FIXING MUBEEN'S PHOTOGRAPHER PROFILE\n");

    const mubeenProfile = await PhotographerProfile.findOne({specialization: "wedding photography "});

    if (!mubeenProfile) {
      console.log("❌ Mubeen's profile not found");
      process.exit(0);
    }

    console.log("BEFORE UPDATE:");
    console.log(`- pricePerHour: ${mubeenProfile.pricePerHour}`);
    console.log(`- city: ${mubeenProfile.city}`);
    console.log(`- experience: ${mubeenProfile.experience}`);
    console.log(`- eventTypes: ${JSON.stringify(mubeenProfile.eventTypes)}`);

    // Update with proper data
    mubeenProfile.pricePerHour = 130;
    mubeenProfile.city = "Karachi";
    mubeenProfile.experience = 8;
    mubeenProfile.eventTypes = ["Wedding", "Engagement", "Bridal"];
    mubeenProfile.availability = true;
    mubeenProfile.rating = 4.8;
    mubeenProfile.totalReviews = 15;
    mubeenProfile.slug = "mubeen-wedding";
    mubeenProfile.metaTitle = "Mubeen - Professional Wedding Photographer Karachi";
    mubeenProfile.metaDescription = "Expert wedding photographer in Karachi with 8+ years experience.";
    mubeenProfile.serviceHighlights = ["Candid Moments", "Traditional Setup", "Video Coverage", "Same Day Editing"];

    await mubeenProfile.save();

    console.log("\nAFTER UPDATE:");
    console.log(`- pricePerHour: ${mubeenProfile.pricePerHour}`);
    console.log(`- city: ${mubeenProfile.city}`);
    console.log(`- experience: ${mubeenProfile.experience}`);
    console.log(`- eventTypes: ${JSON.stringify(mubeenProfile.eventTypes)}`);

    console.log("\n✅ Mubeen's profile has been updated successfully!\n");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
