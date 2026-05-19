require("dotenv").config();
const mongoose = require("mongoose");
// Import User first to register the schema
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Query all published photographers
    const allPhotographers = await PhotographerProfile.find({ isPublished: true }).populate("userId");

    console.log(`📊 Total published photographers: ${allPhotographers.length}\n`);

    allPhotographers.forEach((p, idx) => {
      console.log(`${idx + 1}. Photography ID: ${p._id}`);
      console.log(`   userId field value: ${p.userId}`);
      console.log(`   userId type: ${typeof p.userId}`);
      console.log(`   userId._id: ${p.userId?._id}`);
      console.log(`   Specialization: ${p.specialization}`);
      console.log(`   Is userId null?: ${p.userId === null}`);
      console.log(`   Is userId undefined?: ${p.userId === undefined}`);
      console.log();
    });

    // Now try the populate with specific fields
    console.log("\n" + "=".repeat(60));
    console.log("Testing with populated data (name, email, profileImage):\n");
    
    const photographers2 = await PhotographerProfile.find({ isPublished: true })
      .populate("userId", "name email profileImage");

    photographers2.forEach((p, idx) => {
      console.log(`${idx + 1}. Photography ID: ${p._id}`);
      console.log(`   userId after populate: ${p.userId}`);
      console.log(`   userId._id: ${p.userId?._id}`);
      console.log(`   Specialization: ${p.specialization}`);
      console.log();
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
