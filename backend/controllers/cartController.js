const Cart = require("../models/cart");
const User = require("../models/user");

// Get cart for logged-in user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId }).populate("items.photographerId", "name email profileImage");

    if (!cart) {
      cart = await Cart.create({ userId, items: [], totalCost: 0 });
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
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

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [], totalCost: 0 });
    }

    const totalPrice = duration * pricePerHour;

    const newItem = {
      photographerId,
      eventDate,
      eventType,
      location,
      duration,
      pricePerHour,
      totalPrice,
      notes
    };

    cart.items.push(newItem);
    cart.totalCost = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await cart.save();

    res.json({ success: true, message: "Added to cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    cart.totalCost = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await cart.save();

    res.json({ success: true, message: "Removed from cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { duration, notes } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find(i => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    if (duration) {
      item.duration = duration;
      item.totalPrice = duration * item.pricePerHour;
    }
    if (notes !== undefined) {
      item.notes = notes;
    }

    cart.totalCost = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);
    await cart.save();

    res.json({ success: true, message: "Updated cart item", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.findOneAndUpdate({ userId }, { items: [], totalCost: 0 });

    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
