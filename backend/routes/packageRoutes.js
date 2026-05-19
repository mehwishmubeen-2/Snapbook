const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const packageController = require("../controllers/packageController");

// GET /api/packages/:photographerId — public
router.get("/:photographerId", packageController.getPackages);

// POST /api/packages — JWT protected, photographer only
router.post("/", protect, authorizeRoles("photographer"), packageController.createPackage);

// PUT /api/packages/:id — JWT protected, photographer only
router.put("/:id", protect, authorizeRoles("photographer"), packageController.updatePackage);

// DELETE /api/packages/:id — JWT protected, photographer only
router.delete("/:id", protect, authorizeRoles("photographer"), packageController.deletePackage);

module.exports = router;
