const express = require("express");
const router = express.Router();
const photographerController = require("../controllers/photographerController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/", photographerController.getPhotographersList);
router.get("/filters/event-types", photographerController.getEventTypes);
router.get("/filters/cities", photographerController.getCities);

// Protected routes — must be registered BEFORE /profile/:slug to avoid route conflict
router.get("/profile/me", protect, photographerController.getCurrentPhotographerProfile);
router.post("/profile", protect, photographerController.updatePhotographerProfile);

// Public profile by slug — registered AFTER /profile/me
router.get("/profile/:slug", photographerController.getPhotographerProfile);

module.exports = router;