const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/checkPermission");

router.use(protect, authorizeRoles("admin"));

// Photographer management
router.get("/photographers",                    checkPermission("managePhotographers"), adminController.getPhotographers);
router.get("/photographers/:id",                checkPermission("managePhotographers"), adminController.getPhotographerDetails);
router.patch("/photographers/:id/approve",      checkPermission("managePhotographers"), adminController.approvePhotographer);
router.patch("/photographers/:id/reject",       checkPermission("managePhotographers"), adminController.rejectPhotographer);
router.patch("/photographers/:id/suspend",      checkPermission("managePhotographers"), adminController.suspendPhotographer);
router.patch("/photographers/:id/seo",          checkPermission("managePhotographers"), adminController.updatePhotographerSeo);
router.post("/photographers/:id/seo/generate",  checkPermission("managePhotographers"), adminController.generateAiSeo);
router.patch("/photographers/:id/portfolio",    checkPermission("managePhotographers"), adminController.updatePhotographerPortfolio);

// SEO approval queue
router.get("/seo-queue",                        checkPermission("managePhotographers"), adminController.getSeoQueue);
router.patch("/photographers/:id/seo/approve",  checkPermission("managePhotographers"), adminController.approvePendingSeo);
router.patch("/photographers/:id/seo/reject",   checkPermission("managePhotographers"), adminController.rejectPendingSeo);

// Analytics dashboard
router.get("/analytics",                        adminController.getAnalytics);

module.exports = router;