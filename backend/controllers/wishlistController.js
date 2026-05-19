const Wishlist = require("../models/wishlist");
const User = require("../models/user");

// Get wishlist for logged-in user
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    let wishlist = await Wishlist.findOne({ userId }).populate("photographers.photographerId", "name email profileImage slug");

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, photographers: [] });
    }

    res.json({ success: true, wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add photographer to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photographerId } = req.body;

    if (!photographerId) {
      return res.status(400).json({ success: false, message: "Photographer ID required" });
    }

    const photographer = await User.findById(photographerId);
    if (!photographer || photographer.role !== "photographer") {
      return res.status(400).json({ success: false, message: "Invalid photographer" });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, photographers: [] });
    }

    // Check if already in wishlist
    const exists = wishlist.photographers.some(p => p.photographerId.toString() === photographerId.toString());
    if (exists) {
      return res.status(400).json({ success: false, message: "Already in wishlist" });
    }

    wishlist.photographers.push({ photographerId });
    await wishlist.save();
    await wishlist.populate("photographers.photographerId", "name email profileImage slug");

    res.json({ success: true, message: "Added to wishlist", wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove photographer from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photographerId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.photographers = wishlist.photographers.filter(p => p.photographerId.toString() !== photographerId);
    await wishlist.save();
    await wishlist.populate("photographers.photographerId", "name email profileImage slug");

    res.json({ success: true, message: "Removed from wishlist", wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    await Wishlist.findOneAndUpdate({ userId }, { photographers: [] });

    res.json({ success: true, message: "Wishlist cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
