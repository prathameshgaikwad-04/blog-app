const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User");
const Post = require("../models/Post");

/**
 * GET /api/users/:id/stats
 * Returns:
 * {
 *   postsCount: number,
 *   currentStreak: number,
 *   longestStreak: number,
 *   activity: { "YYYY-MM-DD": number }
 * }
 */
router.get("/:id/stats", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(userId).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Fetch ALL posts by user (needed for heatmap & history)
    const posts = await Post.find({ author: userId })
      .select("createdAt")
      .lean();

    const postsCount = posts.length;

    // 🔹 Build activity map (YYYY-MM-DD => count)
    const activity = {};
    posts.forEach(p => {
      const day = new Date(p.createdAt).toISOString().slice(0, 10);
      activity[day] = (activity[day] || 0) + 1;
    });

    // 🔹 Calculate streaks
    const daysBack = 365;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < daysBack; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      if (activity[key]) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return res.json({
      postsCount,
      currentStreak,
      longestStreak,
      activity
    });
  } catch (err) {
    console.error("GET /api/users/:id/stats error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

