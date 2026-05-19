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

// ── Core middleware (order matters!) ─────────────────────────────────────────
app.use(compression());
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// ── Static files FIRST (before pageRoutes) ───────────────────────────────────
// Serving static assets before pageRoutes prevents route handlers from
// accidentally intercepting requests for JS/CSS/image files.
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ── SEO page routes ───────────────────────────────────────────────────────────
// Loaded AFTER static so asset requests are never caught by page handlers.
const pageRoutes = require("./routes/pageRoutes");
app.use("/", pageRoutes);

// ── API Routes ────────────────────────────────────────────────────────────────
const authRoutes         = require("./routes/authRoutes");
const adminRoutes        = require("./routes/adminRoutes");
const photographerRoutes = require("./routes/photographerRoutes");
const cartRoutes         = require("./routes/cartRoutes");
const wishlistRoutes     = require("./routes/wishlistRoutes");
const orderRoutes        = require("./routes/orderRoutes");
const chatbotRoutes      = require("./routes/chatbotRoutes");
const faqRoutes          = require("./routes/faqRoutes");
const couponRoutes       = require("./routes/couponRoutes");
const analyticsRoutes    = require("./routes/analyticsRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const packageRoutes      = require("./routes/packageRoutes");
const reviewRoutes       = require("./routes/reviewRoutes");
const disputeRoutes      = require("./routes/disputeRoutes");
const commissionRoutes   = require("./routes/commissionRoutes");
const portfolioRoutes    = require("./routes/portfolioRoutes");

// Base API health route
app.get("/api", (req, res) => {
  res.json({ message: "API is running..." });
});

app.use("/api/auth",          authLimiter, authRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/photographers", photographerRoutes);
app.use("/api/cart",          cartRoutes);
app.use("/api/wishlist",      wishlistRoutes);
app.use("/api/orders",        orderRoutes);
app.use("/api/faq",           faqRoutes);
app.use("/api/coupon",        couponRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/availability",  availabilityRoutes);
app.use("/api/packages",      packageRoutes);
app.use("/api/reviews",       reviewRoutes);
app.use("/api/disputes",      disputeRoutes);
app.use("/api/commission",    commissionRoutes);
app.use("/api/portfolio",     portfolioRoutes);
app.use("/api/chat",          chatbotRoutes);

// ── Socket.io ─────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
// Must come AFTER all API routes so it only catches unmatched non-API paths.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message || err);

  const status  = err.status || err.statusCode || 500;
  const message = (process.env.NODE_ENV === "production" && status === 500)
    ? "Internal server error"
    : (err.message || "Something went wrong");

  res.status(status).json({ success: false, message });
});

// ── Start server ──────────────────────────────────────────────────────────────
// Server starts immediately so Render health checks pass while DB connects.
// If DB fails, the error is logged but the process exits so Render can restart.
const PORT = process.env.PORT || 5055;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Let Render restart the service
  });