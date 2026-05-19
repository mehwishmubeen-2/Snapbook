const express = require("express");
const router = express.Router();
const FAQ = require("../models/faq");
const { protect } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/checkPermission");

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Get all FAQs by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { active: true };

    if (category) {
      filter.category = category;
    }

    const faqs = await FAQ.find(filter)
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, faqs });
  } catch (err) {
    console.error("[FAQ GET ERROR]", err);
    res.status(500).json({ success: false, message: "Error fetching FAQs" });
  }
});

// Get FAQ by ID
router.get("/:id", async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    // Increment views
    faq.views += 1;
    await faq.save();

    res.json({ success: true, faq });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching FAQ" });
  }
});

// Search FAQs by keywords
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    const faqs = await FAQ.find({
      $or: [
        { question: { $regex: query, $options: "i" } },
        { answer: { $regex: query, $options: "i" } },
        { keywords: { $in: [new RegExp(query, "i")] } }
      ],
      active: true
    })
      .sort({ views: -1 })
      .limit(10);

    res.json({ success: true, faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error searching FAQs" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Create FAQ
router.post("/", protect, checkPermission("managePhotographers"), async (req, res) => {
  try {
    const { category, question, answer, keywords, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and answer are required" });
    }

    const faq = new FAQ({
      category,
      question,
      answer,
      keywords: keywords || [],
      order: order || 0,
      active: true
    });

    await faq.save();

    console.log("[FAQ] New FAQ created:", question.substring(0, 50));
    res.json({ success: true, faq });
  } catch (err) {
    console.error("[FAQ CREATE ERROR]", err);
    res.status(500).json({ success: false, message: "Error creating FAQ" });
  }
});

// Update FAQ
router.put("/:id", protect, checkPermission("managePhotographers"), async (req, res) => {
  try {
    const { category, question, answer, keywords, order, active } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      {
        category,
        question,
        answer,
        keywords,
        order,
        active,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    console.log("[FAQ] FAQ updated:", question.substring(0, 50));
    res.json({ success: true, faq });
  } catch (err) {
    console.error("[FAQ UPDATE ERROR]", err);
    res.status(500).json({ success: false, message: "Error updating FAQ" });
  }
});

// Delete FAQ
router.delete("/:id", protect, checkPermission("managePhotographers"), async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    console.log("[FAQ] FAQ deleted:", faq.question.substring(0, 50));
    res.json({ success: true, message: "FAQ deleted successfully" });
  } catch (err) {
    console.error("[FAQ DELETE ERROR]", err);
    res.status(500).json({ success: false, message: "Error deleting FAQ" });
  }
});

module.exports = router;
