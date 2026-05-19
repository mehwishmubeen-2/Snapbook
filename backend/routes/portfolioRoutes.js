const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const portfolioController = require("../controllers/portfolioController");

// GET /api/portfolio — get logged-in photographer's portfolio items
router.get("/", protect, authorizeRoles("photographer"), portfolioController.getMyPortfolio);

// POST /api/portfolio — add a new portfolio item
router.post("/", protect, authorizeRoles("photographer"), portfolioController.addPortfolioItem);

// DELETE /api/portfolio/:id — remove a portfolio item
router.delete("/:id", protect, authorizeRoles("photographer"), portfolioController.deletePortfolioItem);

module.exports = router;
