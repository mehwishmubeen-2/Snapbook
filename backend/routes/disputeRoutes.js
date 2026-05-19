const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const disputeController = require("../controllers/disputeController");

// GET /api/disputes/mine — must be before /:id to avoid conflict
router.get("/mine", protect, authorizeRoles("customer"), disputeController.getMyDisputes);

// POST /api/disputes — customer only
router.post("/", protect, authorizeRoles("customer"), disputeController.createDispute);

// GET /api/disputes — admin only
router.get("/", protect, authorizeRoles("admin"), disputeController.getDisputes);

// PATCH /api/disputes/:id — admin only
router.patch("/:id", protect, authorizeRoles("admin"), disputeController.updateDispute);

module.exports = router;
