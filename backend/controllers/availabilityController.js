const Availability = require("../models/availability");
const Order = require("../models/order");

// Day-of-week abbreviations aligned with JS Date.getDay() (0 = Sun)
const DAY_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// GET /api/availability/:photographerId
// Public — returns the photographer's availability document
exports.getAvailability = async (req, res) => {
  try {
    const { photographerId } = req.params;

    const availability = await Availability.findOne({ photographerId });

    // Photographer hasn't configured availability yet — return null rather than 404
    res.json({ success: true, availability: availability || null });
  } catch (err) {
    console.error("getAvailability error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/availability
// Protected — photographer can update their own availability
exports.updateAvailability = async (req, res) => {
  try {
    const photographerId = req.user.id;
    const { workingDays, workingHours, blockedDates } = req.body;

    const update = {};
    if (workingDays !== undefined) update.workingDays = workingDays;
    if (workingHours !== undefined) update.workingHours = workingHours;
    if (blockedDates !== undefined) update.blockedDates = blockedDates;

    const availability = await Availability.findOneAndUpdate(
      { photographerId },
      { $set: update },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, availability });
  } catch (err) {
    console.error("updateAvailability error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/availability/check
// Public — checks if a specific date is bookable for a photographer
// Body: { photographerId, date }
exports.checkSlotAvailable = async (req, res) => {
  try {
    const { photographerId, date } = req.body;

    if (!photographerId || !date) {
      return res.status(400).json({ success: false, message: "photographerId and date are required" });
    }

    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    const availability = await Availability.findOne({ photographerId });

    // No availability record means photographer hasn't configured their schedule
    if (!availability) {
      return res.json({ success: true, available: false, reason: "Photographer has not set their availability" });
    }

    // 1. Check working days
    const dayAbbr = DAY_MAP[requestedDate.getDay()];
    if (!availability.workingDays.includes(dayAbbr)) {
      return res.json({ success: true, available: false, reason: `Photographer does not work on ${dayAbbr}` });
    }

    // 2. Check blocked dates (compare by calendar date, ignoring time)
    const requestedMidnight = new Date(
      requestedDate.getFullYear(),
      requestedDate.getMonth(),
      requestedDate.getDate()
    );
    const isBlocked = availability.blockedDates.some((blocked) => {
      const blockedMidnight = new Date(
        blocked.getFullYear(),
        blocked.getMonth(),
        blocked.getDate()
      );
      return blockedMidnight.getTime() === requestedMidnight.getTime();
    });

    if (isBlocked) {
      return res.json({ success: true, available: false, reason: "Photographer is unavailable on this date" });
    }

    // 3. Check for existing confirmed/pending order on the same calendar day
    const dayStart = new Date(requestedMidnight);
    const dayEnd = new Date(requestedMidnight);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const conflictingOrder = await Order.findOne({
      photographerId,
      status: { $in: ["pending", "confirmed"] },
      eventDate: { $gte: dayStart, $lt: dayEnd },
    });

    if (conflictingOrder) {
      return res.json({ success: true, available: false, reason: "Photographer already has a booking on this date" });
    }

    res.json({ success: true, available: true, reason: "Photographer is available on this date" });
  } catch (err) {
    console.error("checkSlotAvailable error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
