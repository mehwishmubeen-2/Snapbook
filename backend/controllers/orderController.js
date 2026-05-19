const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");

// Get all orders where the logged-in user is the photographer
exports.getPhotographerOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page, limit: limitQ } = req.query;

    const pageNum  = Math.max(1, parseInt(page)   || 1);
    const limitNum = Math.min(50, parseInt(limitQ) || 50);
    const skip     = (pageNum - 1) * limitNum;

    let query = { photographerId: userId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customerId", "name email profileImage phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Photographer updates order status (accept / decline / mark scheduled etc.)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    const allowed = ['confirmed', 'scheduled', 'in-progress', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.photographerId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    order.status = status;
    if (status === 'confirmed') order.acceptedAt = new Date();
    if (status === 'cancelled') order.cancelledAt = new Date();
    await order.save();

    res.json({ success: true, message: `Order ${status}`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all orders for logged-in customer
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page, limit: limitQ } = req.query;

    const pageNum  = Math.max(1, parseInt(page)   || 1);
    const limitNum = Math.min(50, parseInt(limitQ) || 10);
    const skip     = (pageNum - 1) * limitNum;

    let query = { customerId: userId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("photographerId", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate("photographerId", "name email profileImage phone");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only customer or admin can view the order
    if (order.customerId.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, cardInfo, couponCode } = req.body;

    const cart = await Cart.findOne({ userId }).populate('items.photographerId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Distribute any cart-level coupon discount proportionally across items
    const cartDiscount = Number(cart.discount) || 0;
    const cartTotal   = Number(cart.totalCost) || cart.items.reduce((s, i) => s + i.totalPrice, 0);

    // Create an order for each item in the cart
    const orders = [];
    for (const item of cart.items) {
      // Each item's share of the discount = discount × (itemPrice / cartTotal)
      const itemDiscount = cartTotal > 0 ? (cartDiscount * item.totalPrice) / cartTotal : 0;
      const finalAmount  = Math.max(0, Math.round((item.totalPrice - itemDiscount) * 100) / 100);

      const orderData = {
        customerId: userId,
        photographerId: item.photographerId,
        eventDate: item.eventDate,
        eventType: item.eventType,
        location: item.location,
        duration: item.duration,
        pricePerHour: item.pricePerHour,
        totalAmount: finalAmount, // final amount after proportional discount
        notes: item.notes,
        status: "pending",
        paymentMethod: paymentMethod || 'card',
      };

      if (paymentMethod === 'cod') {
        orderData.paymentStatus = 'pending';
      } else {
        // SIMULATING card payment success
        // In a real-world scenario, you would integrate with a payment gateway like Stripe
        // and only set paymentStatus to 'paid' after successful payment confirmation.
        console.log('Simulating successful card payment for user:', userId);
        orderData.paymentStatus = 'paid'; 
      }

      const order = await Order.create(orderData);
      orders.push(order);
    }

    // Clear cart
    await Cart.findOneAndUpdate({ userId }, { items: [], totalCost: 0 });

    res.json({ success: true, message: "Orders created successfully", orders });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: "Server error during order creation" });
  }
};

// Create single order directly (without cart)
exports.createDirectOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photographerId, eventDate, eventType, location, duration = 4, pricePerHour, notes } = req.body;

    if (!photographerId || !eventDate || !eventType || !location || !pricePerHour) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const photographer = await User.findById(photographerId);
    if (!photographer || photographer.role !== "photographer") {
      return res.status(400).json({ success: false, message: "Invalid photographer" });
    }

    const totalAmount = duration * pricePerHour;

    const order = await Order.create({
      customerId: userId,
      photographerId,
      eventDate,
      eventType,
      location,
      duration,
      pricePerHour,
      totalAmount,
      notes,
      status: "pending",
      paymentStatus: "pending"
    });

    res.json({ success: true, message: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.customerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (order.status === "completed" || order.status === "cancelled") {
      return res.status(400).json({ success: false, message: `Cannot cancel ${order.status} order` });
    }

    order.status = "cancelled";
    order.cancellationReason = reason || "Customer requested cancellation";
    order.cancelledAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark order as completed by customer (after event date has passed)
exports.markAsCompleted = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, customerId: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const allowedStatuses = ['confirmed', 'scheduled', 'in-progress', 'pending'];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot mark a '${order.status}' order as completed` });
    }

    // Ensure the event date has passed (or is today)
    const now = new Date();
    const eventDate = new Date(order.eventDate);
    if (eventDate > now) {
      return res.status(400).json({ success: false, message: "Your session hasn't happened yet. You can mark it as done after the event date." });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Session marked as completed. You can now leave a review!", order });
  } catch (error) {
    console.error('markAsCompleted error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark order as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "paid", paymentId, status: "confirmed" },
      { new: true }
    );

    res.json({ success: true, message: "Order marked as paid", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get order tracking info
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate("photographerId", "name email phone profileImage");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.customerId.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const tracking = {
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      eventDate: order.eventDate,
      eventType: order.eventType,
      location: order.location,
      photographer: {
        name: order.photographerId?.name,
        email: order.photographerId?.email,
        phone: order.photographerId?.phone
      },
      totalAmount: order.totalAmount,
      timeline: {
        created: order.createdAt,
        confirmed: order.acceptedAt,
        completed: order.completedAt,
        cancelled: order.cancelledAt
      }
    };

    res.json({ success: true, tracking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
