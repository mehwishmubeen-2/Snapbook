const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const availabilityController = require("../controllers/availabilityController");

// POST /api/availability/check — must be declared before /:photographerId to avoid route conflict
router.post("/check", availabilityController.checkSlotAvailable);

// GET /api/availability/:photographerId — public
router.get("/:photographerId", availabilityController.getAvailability);

// PUT /api/availability — JWT protected, photographer only
router.put("/", protect, authorizeRoles("photographer"), availabilityController.updateAvailability);

module.exports = router;
