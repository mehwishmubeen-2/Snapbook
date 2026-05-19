const Portfolio = require("../models/portfolio");

// GET /api/portfolio
// Protected — returns all portfolio items for the logged-in photographer
exports.getMyPortfolio = async (req, res) => {
  try {
    const photographerId = req.user.id || req.user._id;
    const items = await Portfolio.find({ photographerId }).sort({ createdAt: -1 });
    res.json({ success: true, portfolio: items });
  } catch (err) {
    console.error("getMyPortfolio error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/portfolio
// Protected — add a portfolio item
exports.addPortfolioItem = async (req, res) => {
  try {
    const photographerId = req.user.id || req.user._id;
    const { imageUrl, title, description } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "imageUrl is required" });
    }

    const item = await Portfolio.create({ photographerId, imageUrl, title, description });
    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error("addPortfolioItem error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/portfolio/:id
// Protected — delete a portfolio item (only owner can delete)
exports.deletePortfolioItem = async (req, res) => {
  try {
    const photographerId = (req.user.id || req.user._id).toString();
    const item = await Portfolio.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Portfolio item not found" });
    }

    if (item.photographerId.toString() !== photographerId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Portfolio item removed" });
  } catch (err) {
    console.error("deletePortfolioItem error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
