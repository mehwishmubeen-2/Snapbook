require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n📸 PHOTOGRAPHERS ON FILE:\n");

    const photographers = await PhotographerProfile.find({isPublished: true}).populate('userId', 'name');

    console.log(`Total published photographers: ${photographers.length}\n`);

    photographers.forEach((p, i) => {
      const name = p.userId?.name || 'Unknown';
      const price = p.pricePerHour || 0;
      console.log(`${i+1}. ${name} - Rs. ${price}/hr`);
    });

    console.log(`\n=========================================`);
    console.log(`Total: ${photographers.length} photographers`);
    
    // Check price range
    if (photographers.length > 0) {
      const prices = photographers.map(p => p.pricePerHour || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      console.log(`Price Range: Rs. ${minPrice} - Rs. ${maxPrice}`);
      console.log(`=========================================\n`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
