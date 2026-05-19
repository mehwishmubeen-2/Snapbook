require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n📋 CHECKING MUBEEN'S PROFILE:\n");

    const mubeenProfile = await PhotographerProfile.findOne({specialization: "wedding photography "}).populate('userId', 'name');

    console.log("Current data:");
    console.log(JSON.stringify(mubeenProfile, null, 2));

    console.log("\n❌ MISSING FIELDS:");
    console.log(`- pricePerHour: ${mubeenProfile.pricePerHour}`);
    console.log(`- city: ${mubeenProfile.city}`);
    console.log(`- experience: ${mubeenProfile.experience}`);
    console.log(`- eventTypes: ${JSON.stringify(mubeenProfile.eventTypes)}`);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
