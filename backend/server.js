const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();
const compression = require("compression");
const path = require("path");

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5055";

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: ALLOWED_ORIGIN, credentials: true }
});

// Attach io to app for use in controllers
app.io = io;

app.use(compression());

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// ── SEO page routes MUST come before express.static ──────────────────────────
// /photographer/:slug is served as server-side rendered HTML with injected SEO
// tags so search crawlers see them immediately (no JavaScript required).
const pageRoutes = require("./routes/pageRoutes");
app.use("/", pageRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const photographerRoutes = require("./routes/photographerRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");


const chatbotRoutes = require("./routes/chatbotRoutes");
const faqRoutes = require("./routes/faqRoutes");
const couponRoutes = require("./routes/couponRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const packageRoutes = require("./routes/packageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const PORT = process.env.PORT || 5055;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    
  })
  .catch((err) => console.log(err));

// Base API health route
app.get("/api", (req, res) => {
  res.json({ message: "API is running..." });
});

// Auth routes: register/login, etc. (rate limited)
app.use("/api/auth", authLimiter, authRoutes);

// Admin routes (must send admin token)
app.use("/api/admin", adminRoutes);

// Photographer routes (public)
app.use("/api/photographers", photographerRoutes);

// Customer routes (require authentication)
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);

// FAQ and Coupon routes
app.use("/api/faq", faqRoutes);
app.use("/api/coupon", couponRoutes);

// Analytics routes
app.use("/api/analytics", analyticsRoutes);

// Availability routes
app.use("/api/availability", availabilityRoutes);

// Package routes
app.use("/api/packages", packageRoutes);

// Review routes
app.use("/api/reviews", reviewRoutes);

// Dispute routes
app.use("/api/disputes", disputeRoutes);

// Commission routes
app.use("/api/commission", commissionRoutes);

// Portfolio routes (photographer CRUD for their own portfolio)
app.use("/api/portfolio", portfolioRoutes);

// Chatbot routes
app.use("/api/chat", chatbotRoutes);

// Socket.io for real-time updates
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// SPA fallback: serve index.html for any unknown route (so React Router works for /photographers, etc.)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// Must be defined AFTER all routes. Four-argument signature is required by Express.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message || err);

  const status  = err.status || err.statusCode || 500;
  const message = (process.env.NODE_ENV === "production" && status === 500)
    ? "Internal server error"
    : (err.message || "Something went wrong");

  res.status(status).json({ success: false, message });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});