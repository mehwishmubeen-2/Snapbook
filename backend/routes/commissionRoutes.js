const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const commissionController = require("../controllers/commissionController");

// GET /api/commission/earnings — photographer only
router.get("/earnings", protect, authorizeRoles("photographer"), commissionController.getEarnings);

// GET /api/commission/platform — admin only
router.get("/platform", protect, authorizeRoles("admin"), commissionController.getPlatformRevenue);

module.exports = router;
