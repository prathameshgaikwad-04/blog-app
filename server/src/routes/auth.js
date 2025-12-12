// server/src/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/auth"); // your auth middleware that sets req.user
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const RESET_TTL = process.env.RESET_PASSWORD_TTL ? parseInt(process.env.RESET_PASSWORD_TTL) : 3600000; // 1 hour

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Register
 * expects { username, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed });
    await newUser.save();

    // return created user data + token (include createdAt)
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      token: generateToken(newUser._id)
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Login
 * expects { emailOrUsername, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ message: "Missing fields" });

    // allow login by email or username
    const found = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });
    if (!found) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, found.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    return res.json({
      _id: found._id,
      username: found.username,
      email: found.email,
      createdAt: found.createdAt,
      token: generateToken(found._id)
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Me - returns current user (protected)
 */
router.get("/me", auth, async (req, res) => {
  try {
    const u = await User.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json(u);
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Forgot password (dev-friendly)
 * expects { email }
 * returns resetUrl in response during dev (remove in production)
 */
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      console.log(`[forgot] no user for email ${email}`);
      return res.status(200).json({ message: "If that email exists, a reset link was sent (dev)", resetUrl: null });
    }

    // create a token
    const resetTokenPlain = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetTokenPlain).digest("hex");
    targetUser.resetPasswordToken = hashedToken;
    targetUser.resetPasswordExpires = Date.now() + RESET_TTL;
    await targetUser.save({ validateBeforeSave: false });

    // Compose reset URL using FRONTEND_URL if available
    const frontendBase = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${frontendBase}/reset-password/${resetTokenPlain}`;

    // Log and attempt to send email (best effort). Keep returning resetUrl in response for dev.
    console.log(`[forgot] Password reset link for ${targetUser.email}: ${resetUrl}`);

    // (If you have mailer configured, send here. Omitted for brevity.)

    return res.status(200).json({
      message: "If that email exists, a reset link was sent (dev). Check server logs and response.",
      resetUrl
    });
  } catch (err) {
    console.error("forgot error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Reset password
 * POST /reset/:token { password }
 */
router.post("/reset/:token", async (req, res) => {
  try {
    const tokenPlain = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(tokenPlain).digest("hex");

    const userForReset = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!userForReset) return res.status(400).json({ message: "Token invalid or expired" });

    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password required" });

    userForReset.password = await bcrypt.hash(password, 10);
    userForReset.resetPasswordToken = undefined;
    userForReset.resetPasswordExpires = undefined;
    await userForReset.save();

    return res.json({ message: "Password updated" });
  } catch (err) {
    console.error("reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


