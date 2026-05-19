// Update photographer profile (no file upload)

exports.updatePhotographerProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      bio, specialization, city, state, country,
      experience, pricePerHour, eventTypes,
      serviceDescription, seoHeading, serviceHighlights
    } = req.body;

    let profile = await PhotographerProfile.findOne({ userId });
    if (!profile) {
      profile = new PhotographerProfile({ userId });
    }

    if (bio !== undefined)                profile.bio = bio;
    if (specialization !== undefined)     profile.specialization = specialization;
    if (city !== undefined)               profile.city = city;
    if (state !== undefined)              profile.state = state;
    if (country !== undefined)            profile.country = country;
    if (experience !== undefined)         profile.experience = Number(experience) || 0;
    if (pricePerHour !== undefined)       profile.pricePerHour = Number(pricePerHour) || 0;
    if (eventTypes !== undefined)         profile.eventTypes = Array.isArray(eventTypes) ? eventTypes : [];
    if (serviceDescription !== undefined) profile.serviceDescription = serviceDescription;
    if (seoHeading !== undefined)         profile.seoHeading = seoHeading;
    if (serviceHighlights !== undefined)  profile.serviceHighlights = Array.isArray(serviceHighlights) ? serviceHighlights : [];

    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

// Get current photographer profile
exports.getCurrentPhotographerProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await PhotographerProfile.findOne({ userId }).populate("userId", "name email profileImage");
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

// (Portfolio upload logic removed)
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");
const Portfolio = require("../models/portfolio");

// Get all photographers with search & filters (for homepage listing)
exports.getPhotographersList = async (req, res) => {
  try {
    const { search, eventType, city, sort, page = 1, limit = 10, approved } = req.query;
    
    // Build filter
    let filter = { 
      isPublished: true
    };

    // Search by name or specialization
    if (search) {
      filter.$or = [
        { specialization: new RegExp(search, "i") },
        { bio: new RegExp(search, "i") }
      ];
    }

    // Filter by event type (wedding, portrait, etc.)
    if (eventType) {
      filter.eventTypes = { $in: [eventType] };
    }

    // Filter by city
    if (city) {
      filter.city = new RegExp(city, "i");
    }

    // Sort options
    let sortOption = { rating: -1 };
    if (sort === "price-low") sortOption = { pricePerHour: 1 };
    if (sort === "price-high") sortOption = { pricePerHour: -1 };
    if (sort === "experience") sortOption = { experience: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const skip = (page - 1) * limit;

    console.log("[PHOTOGRAPHERS API] Fetching with filter:", JSON.stringify(filter));

    // Get photographers with populated user data
    const photographers = await PhotographerProfile.find(filter)
      .populate("userId", "name email profileImage")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await PhotographerProfile.countDocuments(filter);

    console.log(`[PHOTOGRAPHERS API] Found ${photographers.length} photographers (total: ${total})`);

    // Format response to include user details in main object for easier access
    // Filter out photographers without valid userId
    const formattedPhotographers = photographers
      .filter(p => {
        const hasUserId = p.userId?._id || p.userId;
        if (!hasUserId) {
          console.warn(`[PHOTOGRAPHERS API WARNING] Filtering out Photographer ${p._id} - has no valid userId`);
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

    res.json({
      success: true,
      photographers: formattedPhotographers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("[PHOTOGRAPHERS API ERROR]", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single photographer profile (for detail page)
exports.getPhotographerProfile = async (req, res) => {
  try {
    const { slug } = req.params;
    const mongoose = require("mongoose");

    // Build query: match by slug field first, or fall back to _id / userId if slug looks like an ObjectId
    let query;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      // Could be a profile _id or a user _id — try both
      query = {
        isPublished: true,
        $or: [
          { slug },
          { _id: slug },
          { userId: slug },
        ],
      };
    } else {
      query = { slug, isPublished: true };
    }

    const profile = await PhotographerProfile.findOne(query)
      .populate("userId", "name email profileImage");

    if (!profile) {
      return res.status(404).json({ message: "Photographer not found" });
    }

    // Get photographer's portfolio
    const portfolio = await Portfolio.find({ photographerId: profile.userId._id });

    res.json({
      success: true,
      profile,
      portfolio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update photographer SEO details
exports.updatePhotographerSEO = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      metaTitle,
      metaDescription,
      metaKeywords,
      seoHeading,
      serviceDescription,
      serviceHighlights,
      eventTypes,
      slug,
      city,
      state,
      country,
      specialization,
      pricePerHour,
      experience,
      isPublished
    } = req.body;

    const profile = await PhotographerProfile.findByIdAndUpdate(
      id,
      {
        metaTitle,
        metaDescription,
        metaKeywords,
        seoHeading,
        serviceDescription,
        serviceHighlights,
        eventTypes,
        slug,
        city,
        state,
        country,
        specialization,
        pricePerHour,
        experience,
        isPublished
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Photographer not found" });
    }

    // Emit real-time update if socket.io available
    if (req.app.io) {
      req.app.io.emit("photographer-seo-updated", { photographerId: profile._id });
    }

    res.json({ success: true, message: "SEO details updated", profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get photographer for admin edit
exports.getPhotographerForEdit = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await PhotographerProfile.findById(id)
      .populate("userId", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Photographer not found" });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get event types (for filters)
exports.getEventTypes = async (req, res) => {
  try {
    const eventTypes = await PhotographerProfile.distinct("eventTypes");
    res.json({ success: true, eventTypes: eventTypes.filter(Boolean) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get cities (for filters)
exports.getCities = async (req, res) => {
  try {
    const cities = await PhotographerProfile.distinct("city", { isPublished: true });
    res.json({ success: true, cities: cities.filter(Boolean) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
