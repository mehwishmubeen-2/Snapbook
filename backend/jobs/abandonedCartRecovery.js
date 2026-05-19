const cron = require('node-cron');
const Cart = require('../models/cart'); // Assuming Cart model exists
const User = require('../models/user'); // Assuming User model exists for notifications

// Function to check and recover abandoned carts
const checkAbandonedCarts = async () => {
  try {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const abandonedCarts = await Cart.find({
      updatedAt: { $lt: threshold },
      lastReminderSent: { $exists: false } // Or your logic for reminders
    }).populate('userId');

    for (const cart of abandonedCarts) {
      // Placeholder: Send reminder (e.g., email or notification)
      console.log(`Sending reminder to user ${cart.userId.email} for abandoned cart`);

      // Update cart to mark reminder sent
      cart.lastReminderSent = new Date();
      await cart.save();
    }
  } catch (error) {
    console.error('Error in abandoned cart recovery:', error);
  }
};

// Start the cron job (runs every hour)
const startAbandonedCartRecoveryJob = () => {
  cron.schedule('0 * * * *', () => { // Every hour at minute 0
    console.log('Running abandoned cart recovery job');
    checkAbandonedCarts();
  });
};

module.exports = { startAbandonedCartRecoveryJob };