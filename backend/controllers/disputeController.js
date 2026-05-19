const Dispute = require("../models/dispute");
const Order = require("../models/order");

// POST /api/disputes
// Protected — customer only
// Body: { orderId, issueDescription, priority }
exports.createDispute = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId, issueDescription, priority } = req.body;

    if (!orderId || !issueDescription) {
      return res.status(400).json({ success: false, message: "orderId and issueDescription are required" });
    }

    // Verify the order belongs to this customer
    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or does not belong to you" });
    }

    // Prevent duplicate disputes for the same order
    const existing = await Dispute.findOne({ bookingId: orderId });
    if (existing) {
      return res.status(409).json({ success: false, message: "A dispute already exists for this order" });
    }

    const dispute = await Dispute.create({
      bookingId: orderId, // stored in bookingId field — order _id
      customerId,
      photographerId: order.photographerId,
      issueDescription,
      priority: priority || "medium",
    });

    res.status(201).json({ success: true, dispute });
  } catch (err) {
    console.error("createDispute error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/disputes
// Protected — admin only
exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("customerId", "name email")
      .populate("photographerId", "name email")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, disputes });
  } catch (err) {
    console.error("getDisputes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/disputes/:id
// Protected — admin only
// Body: { resolution, refundAmount, status }
exports.updateDispute = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { resolution, refundAmount, status } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    const update = { resolvedBy: adminId };
    if (resolution !== undefined) update.resolution = resolution;
    if (refundAmount !== undefined) update.refundAmount = refundAmount;
    if (status !== undefined) update.status = status;

    const updatedDispute = await Dispute.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    // If a refund amount is set, mark the linked order as refunded
    if (refundAmount > 0) {
      await Order.findByIdAndUpdate(dispute.bookingId, {
        $set: { paymentStatus: "refunded" },
      });
    }

    res.json({ success: true, dispute: updatedDispute });
  } catch (err) {
    console.error("updateDispute error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/disputes/mine
// Protected — customer only
exports.getMyDisputes = async (req, res) => {
  try {
    const customerId = req.user.id;

    const disputes = await Dispute.find({ customerId })
      .populate("photographerId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, disputes });
  } catch (err) {
    console.error("getMyDisputes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
