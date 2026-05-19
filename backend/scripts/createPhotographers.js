require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");

const photographers = [
  {
    name: "Ali Hassan",
    email: "ali.wedding@example.com",
    phone: "+923001234567",
    specialization: "Wedding Photography",
    bio: "Capturing your special moments with artistic vision and technical expertise. Specialized in candid wedding moments and traditional setups. 10+ years of experience shooting 200+ weddings across Pakistan.",
    experience: 10,
    city: "Lahore",
    eventTypes: ["Wedding", "Engagement", "Bridal"],
    pricePerHour: 150,
    rating: 4.8,
    totalReviews: 24,
    profileImage: "https://images.unsplash.com/photo-1552720773-6c03d566493f?w=400&h=400&fit=crop",
    slug: "ali-hassan-wedding",
    metaTitle: "Ali Hassan - Professional Wedding Photographer Lahore",
    metaDescription: "Expert wedding photographer in Lahore with 10+ years experience. Specializes in candid and traditional wedding photography.",
    serviceHighlights: ["Candid Moments", "Traditional Setup", "Video Coverage", "Same Day Editing"]
  },
  {
    name: "Sara Khan",
    email: "sara.portrait@example.com",
    phone: "+923009876543",
    specialization: "Portrait & Aesthetic Photography",
    bio: "Creating stunning portraits and aesthetic visuals for personal branding. 6 years experience in fashion, lifestyle, and personal branding photography. Known for artistic editing and unique perspectives.",
    experience: 6,
    city: "Karachi",
    eventTypes: ["Portrait", "Fashion", "Aesthetic", "Personal Branding"],
    pricePerHour: 100,
    rating: 4.9,
    totalReviews: 31,
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    slug: "sara-khan-portrait",
    metaTitle: "Sara Khan - Professional Portrait Photographer Karachi",
    metaDescription: "Award-winning portrait photographer in Karachi. Specializes in aesthetic and fashion photography.",
    serviceHighlights: ["Studio Portraits", "Outdoor Sessions", "Fashion Photography", "Personal Branding"]
  },
  {
    name: "Usman Ahmed",
    email: "usman.events@example.com",
    phone: "+923105555666",
    specialization: "Event & Birthday Photography",
    bio: "Professional event and birthday photographer capturing every precious moment with energy and creativity. 8 years covering corporate events, birthdays, and social gatherings. Quick turnaround on edited photos.",
    experience: 8,
    city: "Islamabad",
    eventTypes: ["Birthday", "Corporate Event", "Social Event", "Conference"],
    pricePerHour: 120,
    rating: 4.7,
    totalReviews: 18,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    slug: "usman-ahmed-events",
    metaTitle: "Usman Ahmed - Professional Event Photographer Islamabad",
    metaDescription: "Experienced event photographer in Islamabad. Specializes in birthday parties, corporate events, and social gatherings.",
    serviceHighlights: ["Live Coverage", "Candid Shots", "Digital Delivery", "Same Week Editing"]
  },
  {
    name: "Fatima Malik",
    email: "fatima.aesthetic@example.com",
    phone: "+923214444777",
    specialization: "Aesthetic & Maternity Photography",
    bio: "Specialized in beautiful and artistic maternity, newborn, and family photography. 7 years creating precious memories for families. Gentle approach with expertise in lighting and composition for emotional storytelling.",
    experience: 7,
    city: "Rawalpindi",
    eventTypes: ["Maternity", "Family", "Newborn", "Lifestyle"],
    pricePerHour: 110,
    rating: 4.9,
    totalReviews: 26,
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    slug: "fatima-malik-aesthetic",
    metaTitle: "Fatima Malik - Maternity & Family Photographer Rawalpindi",
    metaDescription: "Premium maternity and family photographer in Rawalpindi. Specializes in beautiful aesthetic lifestyle photography.",
    serviceHighlights: ["Maternity Sessions", "Family Portraits", "Newborn Photography", "Artistic Editing"]
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Delete existing test photographers
    const existingUsers = await User.deleteMany({
      email: {
        $in: photographers.map(p => p.email)
      }
    });
    console.log(`🗑️  Cleaned up ${existingUsers.deletedCount} existing test photographers\n`);

    // Create photographers
    const createdPhotographers = [];

    for (const photoData of photographers) {
      try {
        // 1. Create User
        const hashedPassword = await bcrypt.hash("photo1234", 10);
        const user = await User.create({
          name: photoData.name,
          email: photoData.email,
          password: hashedPassword,
          phone: photoData.phone,
          role: "photographer",
          isApproved: true, // Approved so they show up
          isActive: true,
          profileImage: photoData.profileImage
        });

        // 2. Create PhotographerProfile
        const profile = await PhotographerProfile.create({
          userId: user._id,
          bio: photoData.bio,
          experience: photoData.experience,
          city: photoData.city,
          specialization: photoData.specialization,
          eventTypes: photoData.eventTypes,
          pricePerHour: photoData.pricePerHour,
          availability: true,
          rating: photoData.rating,
          totalReviews: photoData.totalReviews,
          slug: photoData.slug,
          metaTitle: photoData.metaTitle,
          metaDescription: photoData.metaDescription,
          serviceHighlights: photoData.serviceHighlights,
          isPublished: true
        });

        createdPhotographers.push({
          name: photoData.name,
          email: photoData.email,
          city: photoData.city,
          specialization: photoData.specialization,
          pricePerHour: photoData.pricePerHour,
          rating: photoData.rating
        });

        console.log(`✅ Created: ${photoData.name}`);
        console.log(`   📧 Email: ${photoData.email}`);
        console.log(`   🏙️  City: ${photoData.city}`);
        console.log(`   📸 Specialization: ${photoData.specialization}`);
        console.log(`   💰 Price: Rs. ${photoData.pricePerHour}/hour`);
        console.log(`   ⭐ Rating: ${photoData.rating} (${photoData.totalReviews} reviews)\n`);
      } catch (err) {
        console.error(`❌ Error creating ${photoData.name}:`, err.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 PHOTOGRAPHER SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total photographers created: ${createdPhotographers.length}\n`);

    createdPhotographers.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   • City: ${p.city}`);
      console.log(`   • Specialty: ${p.specialization}`);
      console.log(`   • Rate: Rs. ${p.pricePerHour}/hr | Rating: ⭐ ${p.rating}`);
      console.log();
    });

    console.log("=".repeat(60));
    console.log("\n✨ All photographers are APPROVED and will appear on the dashboard!\n");
    console.log("📱 TEST LOGIN CREDENTIALS:");
    console.log("─".repeat(60));
    photographers.forEach(p => {
      console.log(`Email: ${p.email}`);
      console.log(`Password: photo1234\n`);
    });
    console.log("─".repeat(60));
    console.log("\n🎯 Next steps:");
    console.log("1. Start server: npm start");
    console.log("2. Login as customer from dashboard");
    console.log("3. Search for photographers (try: 'wedding', 'portrait', 'birthday')");
    console.log("4. Click on photographer to view profile\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
