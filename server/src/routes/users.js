const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// require your models (adjust paths if different)
const User = require("../models/User");
const Post = require("../models/Post");

/**
 * GET /api/users/:id/stats
 * Returns:
 *   { postsCount: number, longestStreak: number, currentStreak: number }
 */
router.get("/:id/stats", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user id" });

    // Verify user exists (optional)
    const user = await User.findById(userId).select("_id createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Count posts by this user
    const postsCount = await Post.countDocuments({ author: userId });

    // Optional: compute simple streaks (example on last N days)
    // If your Post model has createdAt, we can compute currentStreak/longestStreak.
    const daysToCheck = 30; // you can increase
    const since = new Date();
    since.setDate(since.getDate() - daysToCheck);
    const posts = await Post.find({ author: userId, createdAt: { $gte: since } })
                            .select("createdAt")
                            .lean();

    // map dates to counts
    const byDay = {};
    posts.forEach(p => {
      const d = new Date(p.createdAt).toISOString().slice(0,10);
      byDay[d] = (byDay[d] || 0) + 1;
    });

    // calculate simple current streak (consecutive days ending today with >=1 post)
    let streak = 0;
    let longest = 0;
    let cur = 0;
    for (let i = 0; i < daysToCheck; i++) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0,10);
      if (byDay[key]) {
        cur += 1;
        if (cur > longest) longest = cur;
      } else {
        // reset current consecutive run
        cur = 0;
      }
      // if we're at day 0 and there was a post, cur>0; if not, streak=0
    }
    // current streak (consecutive days ending today)
    let currentStreak = 0;
    for (let i = 0; ; i++) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0,10);
      if (byDay[key]) currentStreak++;
      else break;
      if (i > daysToCheck) break;
    }

    return res.json({
      postsCount,
      longestStreak: longest,
      currentStreak
    });
  } catch (err) {
    console.error("GET /api/users/:id/stats error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
