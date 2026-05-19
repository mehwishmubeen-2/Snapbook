const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

// Validation rules for registration — export so authRoutes can apply them as middleware
exports.registerValidation = [
  body("email")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("role")
    .optional()
    .isIn(["customer", "photographer"]).withMessage("Role must be 'customer' or 'photographer'"),
];

const generateToken = (user) => {
  const tokenData = { id: user._id, role: user.role };
  
  // Include admin permissions if user is admin
  if (user.role === "admin") {
    tokenData.adminPermissions = user.adminPermissions;
  }
  
  return jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register customer or photographer (admin is NOT public)
exports.register = async (req, res) => {
  try {
    // express-validator result check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Only allow customer or photographer via public register
    let finalRole = role || "customer";
    if (!["customer", "photographer"].includes(finalRole)) {
      return res.status(400).json({ message: "Invalid role for public registration" });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: finalRole,
      // customers can be treated as approved immediately; photographers wait for admin
      isApproved: finalRole === "photographer" ? false : true,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Block photographers until admin approval
    if (user.role === "photographer" && !user.isApproved) {
      return res.status(403).json({ message: "Photographer account pending admin approval" });
    }

    const token = generateToken(user);

    res.json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
