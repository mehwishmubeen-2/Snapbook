require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const email = "admin@example.com";
    const plainPassword = "admin1234";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists with email:", email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = await User.create({
      name: "Super Admin",
      email,
      password: hashedPassword,
      phone: "+1234567890",
      role: "admin",
      isApproved: true,
      isActive: true,
      adminPermissions: {
        managePhotographers: true,
        manageBookings: true,
        managePayments: true,
        manageReviews: true,
        manageUsers: true,
        viewAnalytics: true,
        handleDisputes: true
      }
    });

    console.log("\n✅ Admin created successfully!");
    console.log("================================================");
    console.log("Email:", admin.email);
    console.log("Password:", plainPassword);
    console.log("================================================\n");
    console.log("⚠️  IMPORTANT: Change this password after first login!");
    console.log("📍 Admin Dashboard: http://localhost:5009/admin-dashboard.html\n");
    
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
})();