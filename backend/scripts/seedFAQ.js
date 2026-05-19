// ══════════════════════════════════════════════════════════════════════════════
// SEED FAQ DATA
// ══════════════════════════════════════════════════════════════════════════════
// Run: node seedFAQ.js

const mongoose = require("mongoose");
require("../config/db");
const FAQ = require("../models/faq");

const faqData = [
  {
    category: "Booking",
    question: "How do I book a photographer?",
    answer: "You can browse photographers on our platform, check their portfolios, rates, and availability. Once you find someone suitable, add them to your cart and proceed with booking. You can also use our chat assistant to help you find the right photographer.",
    keywords: ["book", "booking", "photographer", "how to", "reserve"],
    order: 1,
    active: true
  },
  {
    category: "Booking",
    question: "Can I change my booking date after booking?",
    answer: "Yes, you can modify your booking date or time up to 48 hours before the scheduled shoot. You can manage your bookings from your customer dashboard. If you need to reschedule beyond this window, please contact support.",
    keywords: ["change", "reschedule", "date", "time", "modify"],
    order: 2,
    active: true
  },
  {
    category: "Cancellation",
    question: "What is the cancellation policy?",
    answer: "You can cancel your booking up to 48 hours before the scheduled date for a full refund. Cancellations within 48 hours incur a 50% cancellation fee. Cancellations within 24 hours forfeit the full amount.",
    keywords: ["cancel", "refund", "cancellation", "policy"],
    order: 3,
    active: true
  },
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer: "We accept multiple payment methods including: Credit/Debit Cards (Visa, Mastercard), Bank Transfers, and Digital Wallets (JazzCash, Easypaisa). All payments are secure and processed through encrypted connections.",
    keywords: ["payment", "methods", "card", "visa", "mastercard", "bank", "wallet"],
    order: 4,
    active: true
  },
  {
    category: "Payment",
    question: "Is it safe to pay online?",
    answer: "Yes, our payment system is fully secure. We use SSL encryption and work with verified payment gateways. Your card information is never stored on our servers and is processed according to international security standards (PCI DSS).",
    keywords: ["safe", "secure", "payment", "encryption", "ssl"],
    order: 5,
    active: true
  },
  {
    category: "Discounts",
    question: "Do you offer coupon codes or discounts?",
    answer: "Yes, we regularly offer promotional codes and discounts. You can find current offers on our homepage and receive them via email. You can apply coupon codes at checkout, and our chat assistant can help you find available discounts.",
    keywords: ["coupon", "discount", "promo", "code", "offer"],
    order: 6,
    active: true
  },
  {
    category: "Photographer",
    question: "How are photographers verified on SnapBook?",
    answer: "All photographers on our platform go through a verification process including: Identity verification, Portfolio review, and Customer feedback system. You can check a photographer's verification status and user reviews on their profile.",
    keywords: ["verified", "photographer", "verification", "trusted", "authentic"],
    order: 7,
    active: true
  },
  {
    category: "Reviews",
    question: "Can I leave a review for a photographer?",
    answer: "Yes, after your booking is completed, you can leave a review and rating for the photographer. This helps other users make informed decisions and helps photographers improve their service. Honest and constructive feedback is appreciated.",
    keywords: ["review", "rating", "feedback", "star", "comment"],
    order: 8,
    active: true
  },
  {
    category: "Technical",
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page. Enter your email address, and we'll send you a password reset link. Click the link in your email and create a new password. If you don't receive the email, check your spam folder.",
    keywords: ["password", "reset", "forgot", "login", "email"],
    order: 9,
    active: true
  },
  {
    category: "Account",
    question: "How do I become a photographer on SnapBook?",
    answer: "Click 'Join as Photographer' and fill out the registration form. You'll need to provide your identity documents, bank details, and portfolio samples. Our team will review your application and contact you within 3-5 business days.",
    keywords: ["photographer", "join", "signup", "register", "become"],
    order: 10,
    active: true
  },
  {
    category: "Support",
    question: "How can I contact customer support?",
    answer: "You can reach our support team through: Live Chat (available 24/7), Email (support@snapbook.com), or by filling out our contact form. Average response time is under 2 hours.",
    keywords: ["support", "help", "contact", "customer service", "assistance"],
    order: 11,
    active: true
  },
  {
    category: "Orders",
    question: "How do I track my order?",
    answer: "You can view your booking status anytime in your customer dashboard under 'My Bookings'. Our chat assistant can also show you the current status and timeline of your bookings. You'll receive email notifications for important updates.",
    keywords: ["track", "order", "status", "booking", "follow"],
    order: 12,
    active: true
  }
];

async function seedFAQData() {
  try {
    console.log("Connecting to database...");
    
    // Clear existing FAQs
    const deleteResult = await FAQ.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing FAQs`);

    // Insert new FAQs
    const result = await FAQ.insertMany(faqData);
    console.log(`✅ Successfully seeded ${result.length} FAQs`);

    // Display seeded data
    console.log("\n📋 Seeded FAQ Categories:");
    const categories = await FAQ.distinct("category");
    categories.forEach(cat => {
      console.log(`  • ${cat}`);
    });

    console.log("\n✨ FAQ Seeding Complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding FAQs:", err.message);
    process.exit(1);
  }
}

seedFAQData();
