const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");
const Portfolio = require("../models/portfolio");
const Order = require("../models/order");
const mongoose = require("mongoose");

exports.getPhotographers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [photographers, total] = await Promise.all([
      User.find({ role: "photographer" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password"),
      User.countDocuments({ role: "photographer" }),
    ]);

    res.json({
      photographers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to load photographers", error: error.message });
  }
};

exports.getPhotographerDetails = async (req, res) => {
  try {
    const photographer = await User.findOne({ _id: req.params.id, role: "photographer" }).select("-password");
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });

    const profile = await PhotographerProfile.findOne({ userId: photographer._id });
    const portfolio = await Portfolio.find({ photographerId: photographer._id });

    res.json({ photographer, profile, portfolio });
  } catch (error) {
    res.status(500).json({ message: "Unable to load photographer details", error: error.message });
  }
};

exports.approvePhotographer = async (req, res) => {
  try {
    const adminId = (req.user && (req.user._id || req.user.id || req.user)) || 'unknown';
    console.log(`[ADMIN] Approve request for photographer ${req.params.id} by ${adminId}`);
    const photographer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "photographer" },
      { isApproved: true, isActive: true },
      { returnDocument: 'after' }
    ).select("-password");
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });
    console.log(`[ADMIN] Photographer approved: ${photographer._id}`);
    res.json({ success: true, photographer });
  } catch (error) {
    res.status(500).json({ message: "Unable to approve photographer", error: error.message });
  }
};

exports.rejectPhotographer = async (req, res) => {
  try {
    const adminId2 = (req.user && (req.user._id || req.user.id || req.user)) || 'unknown';
    console.log(`[ADMIN] Reject request for photographer ${req.params.id} by ${adminId2}`);
    const photographer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "photographer" },
      { isApproved: false, isActive: false },
      { returnDocument: 'after' }
    ).select("-password");
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });
    console.log(`[ADMIN] Photographer rejected: ${photographer._id}`);
    res.json({ success: true, photographer });
  } catch (error) {
    res.status(500).json({ message: "Unable to reject photographer", error: error.message });
  }
};

exports.suspendPhotographer = async (req, res) => {
  try {
    const photographer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "photographer" },
      { isApproved: false, isActive: false },
      { new: true }
    ).select("-password");
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });
    res.json(photographer);
  } catch (error) {
    res.status(500).json({ message: "Unable to suspend photographer", error: error.message });
  }
};

exports.updatePhotographerSeo = async (req, res) => {
  try {
    // Verify the photographer user exists
    const photographer = await User.findOne({ _id: req.params.id, role: "photographer" }).select("-password");
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });

    const { metaTitle, metaDescription, metaKeywords, seoHeading, slug } = req.body;

    // Validate required fields
    if (!metaTitle || !metaTitle.trim()) {
      return res.status(400).json({ message: "Meta title is required" });
    }

    const seoUpdates = {};
    if (metaTitle !== undefined) seoUpdates.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) seoUpdates.metaDescription = metaDescription.trim();
    if (metaKeywords !== undefined) {
      seoUpdates.metaKeywords = Array.isArray(metaKeywords)
        ? metaKeywords.map(k => k.trim()).filter(Boolean)
        : String(metaKeywords).split(',').map(k => k.trim()).filter(Boolean);
    }
    if (seoHeading !== undefined) seoUpdates.seoHeading = seoHeading.trim();
    if (slug !== undefined) seoUpdates.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    // Mark as approved so the page renderer serves these tags immediately
    seoUpdates.seoStatus = 'approved';

    // Upsert the PhotographerProfile SEO fields
    const profile = await PhotographerProfile.findOneAndUpdate(
      { userId: req.params.id },
      { $set: seoUpdates },
      { new: true, upsert: false }
    );

    if (!profile) return res.status(404).json({ message: "Photographer profile not found. Please ensure the photographer has completed their profile." });

    res.json({ success: true, photographer, profile });
  } catch (error) {
    res.status(500).json({ message: "Unable to update SEO", error: error.message });
  }
};

exports.updatePhotographerPortfolio = async (req, res) => {
  try {
    const portfolioItems = Array.isArray(req.body.portfolio) ? req.body.portfolio : [];
    const photographer = await User.findOne({ _id: req.params.id, role: "photographer" });
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });

    await Portfolio.deleteMany({ photographerId: photographer._id });
    const created = await Portfolio.create(
      portfolioItems.map((item) => ({ photographerId: photographer._id, ...item }))
    );

    res.json({ photographer, portfolio: created });
  } catch (error) {
    res.status(500).json({ message: "Unable to update portfolio", error: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// AI SEO GENERATOR — uses Groq to auto-generate SEO fields from profile data
// ══════════════════════════════════════════════════════════════════════════════

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

async function callGroq(messages, systemPrompt, modelIndex = 0) {
  if (modelIndex >= GROQ_MODELS.length) throw new Error("All Groq models exhausted");
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODELS[modelIndex],
        max_tokens: 600,
        temperature: 0.7,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });
    if (response.status === 429) return callGroq(messages, systemPrompt, modelIndex + 1);
    const data = await response.json();
    if (!data.choices || !data.choices[0]) throw new Error("Empty Groq response");
    return data.choices[0].message.content;
  } catch (e) {
    console.error(`[GROQ-SEO] model ${GROQ_MODELS[modelIndex]} failed:`, e.message);
    return callGroq(messages, systemPrompt, modelIndex + 1);
  }
}

exports.generateAiSeo = async (req, res) => {
  try {
    const photographer = await User.findOne({ _id: req.params.id, role: "photographer" }).select("-password");
    if (!photographer) return res.status(404).json({ message: "Photographer not found" });

    const profile = await PhotographerProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: "Photographer profile not found. The photographer must complete their profile first." });

    // Build rich context for the AI
    const name         = photographer.name || "Photographer";
    const city         = profile.city || "";
    const state        = profile.state || "";
    const country      = profile.country || "Pakistan";
    const bio          = profile.bio || "";
    const specialization = profile.specialization || "";
    const eventTypes   = (profile.eventTypes || []).join(", ");
    const experience   = profile.experience ? `${profile.experience} years` : "";
    const pricePerHour = profile.pricePerHour ? `PKR ${profile.pricePerHour}/hr` : "";
    const highlights   = (profile.serviceHighlights || []).join(", ");
    const location     = [city, state, country].filter(Boolean).join(", ");

    const systemPrompt = `You are an expert SEO specialist for a photography booking platform called SnapBook, based in Pakistan. Your task is to generate optimized SEO metadata for a photographer's public profile page. Always respond with ONLY a valid JSON object — no markdown, no explanation, no extra text.`;

    const userMessage = `Generate SEO metadata for this photographer profile:

Name: ${name}
Location: ${location}
Specialization: ${specialization}
Event Types: ${eventTypes || "general photography"}
Experience: ${experience}
Price: ${pricePerHour}
Bio: ${bio}
Service Highlights: ${highlights}

Return a JSON object with exactly these keys:
{
  "metaTitle": "50-60 char title optimized for search, include name + city + niche",
  "metaDescription": "120-158 char compelling description for search snippet",
  "metaKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "seoHeading": "H1 heading — punchy, keyword-rich, under 70 chars",
  "slug": "url-slug-lowercase-hyphens-name-city"
}

Rules:
- Include city name in title, description, and slug if available
- Keywords should mix broad (wedding photographer) + local (lahore photographer) + niche terms
- Slug: lowercase, hyphens only, max 50 chars, no special characters
- All text must be natural, not keyword-stuffed`;

    const rawText = await callGroq(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    // Parse JSON from AI response — strip any accidental markdown fences
    let suggested;
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      // Extract JSON object from response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      suggested = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[GROQ-SEO] JSON parse failed:", rawText);
      return res.status(500).json({ message: "AI returned an unreadable response. Please try again.", raw: rawText });
    }

    // Validate and sanitize output
    const sanitized = {
      metaTitle:       (suggested.metaTitle       || "").toString().slice(0, 70),
      metaDescription: (suggested.metaDescription || "").toString().slice(0, 160),
      metaKeywords:    Array.isArray(suggested.metaKeywords)
        ? suggested.metaKeywords.map(k => String(k).trim()).filter(Boolean).slice(0, 10)
        : [],
      seoHeading:      (suggested.seoHeading || "").toString().slice(0, 100),
      slug:            (suggested.slug || "").toString().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60),
    };

    res.json({ success: true, suggested: sanitized });
  } catch (error) {
    console.error("[GROQ-SEO] generateAiSeo error:", error.message);
    res.status(500).json({ message: "AI SEO generation failed", error: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// SEO APPROVAL QUEUE
// ══════════════════════════════════════════════════════════════════════════════

exports.getSeoQueue = async (req, res) => {
  try {
    const profiles = await PhotographerProfile.find({ seoStatus: "pending_review" })
      .populate("userId", "name email profileImage")
      .select(
        "userId pendingMetaTitle pendingMetaDescription pendingMetaKeywords " +
        "pendingSeoHeading pendingSlug seoGeneratedAt city specialization eventTypes"
      )
      .sort({ seoGeneratedAt: -1 });

    res.json({ success: true, queue: profiles });
  } catch (error) {
    res.status(500).json({ message: "Failed to load SEO queue", error: error.message });
  }
};

exports.approvePendingSeo = async (req, res) => {
  try {
    const profile = await PhotographerProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: "Photographer profile not found" });
    if (profile.seoStatus !== "pending_review") {
      return res.status(400).json({ message: "No pending SEO tags to approve for this photographer" });
    }

    // Promote pending tags → live tags
    const updated = await PhotographerProfile.findByIdAndUpdate(
      profile._id,
      {
        $set: {
          seoStatus:       "approved",
          metaTitle:        profile.pendingMetaTitle,
          metaDescription:  profile.pendingMetaDescription,
          metaKeywords:     profile.pendingMetaKeywords,
          seoHeading:       profile.pendingSeoHeading,
          ...(profile.pendingSlug ? { slug: profile.pendingSlug } : {}),
        },
        $unset: {
          pendingMetaTitle:       "",
          pendingMetaDescription: "",
          pendingMetaKeywords:    "",
          pendingSeoHeading:      "",
          pendingSlug:            "",
          seoGeneratedAt:         "",
        },
      },
      { new: true }
    );

    res.json({ success: true, message: "SEO tags approved and are now live.", profile: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve SEO", error: error.message });
  }
};

exports.rejectPendingSeo = async (req, res) => {
  try {
    const profile = await PhotographerProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: "Photographer profile not found" });

    await PhotographerProfile.findByIdAndUpdate(profile._id, {
      $set:   { seoStatus: "none" },
      $unset: {
        pendingMetaTitle:       "",
        pendingMetaDescription: "",
        pendingMetaKeywords:    "",
        pendingSeoHeading:      "",
        pendingSlug:            "",
        seoGeneratedAt:         "",
      },
    });

    res.json({ success: true, message: "SEO tags rejected. AI will regenerate on next profile visit." });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject SEO", error: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ANALYTICS DASHBOARD
// GET /api/admin/analytics
// ══════════════════════════════════════════════════════════════════════════════
exports.getAnalytics = async (req, res) => {
  try {
    const PLATFORM_FEE_RATE = 0.15;

    // ── 1. Platform-wide totals ──────────────────────────────────────────────
    const [totalUsers, totalPhotographers, totalCustomers, orderStats] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "photographer" }),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0] } },
            totalOrders: { $sum: 1 },
            completedOrders: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            pendingOrders:   { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            confirmedOrders: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
            cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            inProgressOrders:{ $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const stats = orderStats[0] || {
      totalRevenue: 0, totalOrders: 0, completedOrders: 0,
      pendingOrders: 0, confirmedOrders: 0, cancelledOrders: 0, inProgressOrders: 0,
    };

    // ── 2. Photographers sorted by rating (high → low) with booking counts ──
    const photographersByRating = await PhotographerProfile.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "orders",
          localField: "userId",
          foreignField: "photographerId",
          as: "orders",
        },
      },
      {
        $project: {
          _id: 0,
          photographerId: "$userId",
          name: "$user.name",
          profileImage: "$user.profileImage",
          city: 1,
          specialization: 1,
          eventTypes: 1,
          rating: { $ifNull: ["$rating", 0] },
          totalReviews: { $ifNull: ["$totalReviews", 0] },
          totalBookings: { $size: "$orders" },
          completedBookings: {
            $size: {
              $filter: {
                input: "$orders",
                as: "o",
                cond: { $eq: ["$$o.status", "completed"] },
              },
            },
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$orders",
                    as: "o",
                    cond: { $eq: ["$$o.status", "completed"] },
                  },
                },
                as: "o",
                in: "$$o.totalAmount",
              },
            },
          },
          pricePerHour: 1,
        },
      },
      { $sort: { rating: -1, totalBookings: -1 } },
      { $limit: 20 },
    ]);

    // ── 3. Monthly orders & revenue trend (last 12 months) ──────────────────
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                  { $subtract: ["$_id.month", 1] },
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          orders: 1,
          revenue: 1,
          platformFee: { $round: [{ $multiply: ["$revenue", PLATFORM_FEE_RATE] }, 2] },
        },
      },
    ]);

    // ── 4. Revenue by event type (category) ─────────────────────────────────
    const revenueByCategory = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $ifNull: ["$eventType", "Other"] },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          revenue: 1,
          orders: 1,
          platformFee: { $round: [{ $multiply: ["$revenue", PLATFORM_FEE_RATE] }, 2] },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // ── 5. Order status breakdown (for doughnut chart) ───────────────────────
    const orderStatusBreakdown = [
      { status: "completed",   count: stats.completedOrders },
      { status: "pending",     count: stats.pendingOrders },
      { status: "confirmed",   count: stats.confirmedOrders },
      { status: "in-progress", count: stats.inProgressOrders },
      { status: "cancelled",   count: stats.cancelledOrders },
    ].filter(s => s.count > 0);

    // ── 6. Top 10 photographers by booking count ─────────────────────────────
    const topByBookings = await Order.aggregate([
      {
        $group: {
          _id: "$photographerId",
          totalBookings: { $sum: 1 },
          completedBookings: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "photographerprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          photographerId: "$_id",
          name: "$user.name",
          rating: { $ifNull: ["$profile.rating", 0] },
          totalBookings: 1,
          completedBookings: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
    ]);

    // ── 7. New users registered per month (last 6 months) ───────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const newUsersMonthly = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, role: "$role" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                  { $subtract: ["$_id.month", 1] },
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          role: "$_id.role",
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      overview: {
        totalUsers,
        totalPhotographers,
        totalCustomers,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        totalPlatformFee: Math.round(stats.totalRevenue * PLATFORM_FEE_RATE * 100) / 100,
        completedOrders: stats.completedOrders,
        pendingOrders: stats.pendingOrders,
        confirmedOrders: stats.confirmedOrders,
        inProgressOrders: stats.inProgressOrders,
        cancelledOrders: stats.cancelledOrders,
      },
      photographersByRating,
      monthlyTrend,
      revenueByCategory,
      orderStatusBreakdown,
      topByBookings,
      newUsersMonthly,
    });
  } catch (err) {
    console.error("[ADMIN] getAnalytics error:", err);
    res.status(500).json({ success: false, message: "Failed to load analytics", error: err.message });
  }
};