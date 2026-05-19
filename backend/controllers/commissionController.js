const Order = require("../models/order");
const mongoose = require("mongoose");

const PLATFORM_FEE_RATE = 0.15; // 15%
const PHOTOGRAPHER_RATE = 0.85; // 85%

// GET /api/commission/earnings
// Protected — photographer only
exports.getEarnings = async (req, res) => {
  try {
    const photographerId = new mongoose.Types.ObjectId(req.user.id);

    // Total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { photographerId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const platformFee = Math.round(totalRevenue * PLATFORM_FEE_RATE * 100) / 100;
    const photographerEarning = Math.round(totalRevenue * PHOTOGRAPHER_RATE * 100) / 100;

    // Monthly breakdown from completed orders
    const monthlyBreakdown = await Order.aggregate([
      { $match: { photographerId, status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$eventDate" },
            month: { $month: "$eventDate" },
          },
          amount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                  { $subtract: ["$_id.month", 1] },
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          amount: 1,
        },
      },
    ]);

    // Pending orders count and total amount
    const pendingResult = await Order.aggregate([
      { $match: { photographerId, status: { $in: ["pending", "confirmed"] } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" },
        },
      },
    ]);
    const pendingCount = pendingResult.length > 0 ? pendingResult[0].count : 0;
    const pendingAmount = pendingResult.length > 0 ? pendingResult[0].amount : 0;

    res.json({
      success: true,
      totalRevenue,
      platformFee,
      photographerEarning,
      monthlyBreakdown,
      pendingOrders: { count: pendingCount, amount: pendingAmount },
    });
  } catch (err) {
    console.error("getEarnings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/commission/platform
// Protected — admin only
exports.getPlatformRevenue = async (req, res) => {
  try {
    // Overall totals from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, orderCount: { $sum: 1 } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const totalOrders = revenueResult.length > 0 ? revenueResult[0].orderCount : 0;
    const totalPlatformFee = Math.round(totalRevenue * PLATFORM_FEE_RATE * 100) / 100;
    const totalPhotographerPayouts = Math.round(totalRevenue * PHOTOGRAPHER_RATE * 100) / 100;

    // Per-photographer breakdown
    const perPhotographer = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$photographerId",
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "photographer",
        },
      },
      { $unwind: { path: "$photographer", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          photographerId: "$_id",
          name: "$photographer.name",
          email: "$photographer.email",
          revenue: 1,
          orders: 1,
          platformFee: { $round: [{ $multiply: ["$revenue", PLATFORM_FEE_RATE] }, 2] },
          payout: { $round: [{ $multiply: ["$revenue", PHOTOGRAPHER_RATE] }, 2] },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Monthly breakdown (all photographers combined)
    const monthlyBreakdown = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { year: { $year: "$eventDate" }, month: { $month: "$eventDate" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                  { $subtract: ["$_id.month", 1] },
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          revenue: 1,
          platformFee: { $round: [{ $multiply: ["$revenue", PLATFORM_FEE_RATE] }, 2] },
          orders: 1,
        },
      },
    ]);

    res.json({
      success: true,
      totalRevenue,
      totalOrders,
      totalPlatformFee,
      totalPhotographerPayouts,
      perPhotographer,
      monthlyBreakdown,
    });
  } catch (err) {
    console.error("getPlatformRevenue error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
