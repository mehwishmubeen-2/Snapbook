const Package = require("../models/package");

// GET /api/packages/:photographerId
// Public — returns all active packages for a photographer
exports.getPackages = async (req, res) => {
  try {
    const { photographerId } = req.params;

    const packages = await Package.find({ photographerId, active: true }).sort({
      price: 1,
    });

    res.json({ success: true, packages });
  } catch (err) {
    console.error("getPackages error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/packages
// Protected — photographer only, max 3 packages per photographer
exports.createPackage = async (req, res) => {
  try {
    const photographerId = req.user.id;
    const { name, price, duration, features } = req.body;

    // Enforce maximum of 3 packages (one per tier)
    const existingCount = await Package.countDocuments({ photographerId });
    if (existingCount >= 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum of 3 packages allowed per photographer",
      });
    }

    // Prevent duplicate tier names for the same photographer
    const duplicate = await Package.findOne({ photographerId, name });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `A "${name}" package already exists for this photographer`,
      });
    }

    const pkg = await Package.create({
      photographerId,
      name,
      price,
      duration,
      features: features || [],
    });

    res.status(201).json({ success: true, package: pkg });
  } catch (err) {
    console.error("createPackage error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/packages/:id
// Protected — photographer can only update their own package
exports.updatePackage = async (req, res) => {
  try {
    const photographerId = req.user.id;
    const { id } = req.params;
    const { name, price, duration, features, active } = req.body;

    const pkg = await Package.findById(id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    if (pkg.photographerId.toString() !== photographerId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this package" });
    }

    // If renaming, ensure the new tier name isn't already taken by another package
    if (name && name !== pkg.name) {
      const duplicate = await Package.findOne({ photographerId, name, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `A "${name}" package already exists for this photographer`,
        });
      }
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (price !== undefined) update.price = price;
    if (duration !== undefined) update.duration = duration;
    if (features !== undefined) update.features = features;
    if (active !== undefined) update.active = active;

    const updated = await Package.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    res.json({ success: true, package: updated });
  } catch (err) {
    console.error("updatePackage error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/packages/:id
// Protected — photographer can only delete their own package
exports.deletePackage = async (req, res) => {
  try {
    const photographerId = req.user.id;
    const { id } = req.params;

    const pkg = await Package.findById(id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    if (pkg.photographerId.toString() !== photographerId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this package" });
    }

    await pkg.deleteOne();

    res.json({ success: true, message: "Package deleted" });
  } catch (err) {
    console.error("deletePackage error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
