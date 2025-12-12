// server/src/routes/posts.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const Post = require("../models/Post");
const auth = require("../middleware/auth");
const router = express.Router();

/**
 * Upload directory - place uploads at server/uploads
 * __dirname -> server/src/routes, so go up two levels to server/
 */
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer storage config (same pattern as upload.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,9);
    cb(null, `${base}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
  fileFilter: (req, file, cb) => {
    if (/^image\/|^video\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image/video files are allowed"), false);
  }
});

/* ---------- ROUTES ---------- */

/**
 * GET /api/posts
 * list posts (most recent first)
 */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username").sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/posts/user/:userId
 * user posts (history) - keep above /:id so it doesn't get swallowed
 */
router.get("/user/:userId", auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) return res.status(403).json({ message: "Not authorized" });
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/posts/:id
 * get single post by id
 */
router.get("/:id", async (req, res) => {
  try {
    const p = await Post.findById(req.params.id).populate("author", "username");
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/posts
 * Create a new post.
 * Accepts:
 * - JSON body { title, body, media }  (existing behavior)
 * - OR multipart/form-data with fields 'title','body' and optional file 'avatar' (fallback)
 *
 * Protected by `auth`
 */
router.post("/", auth, upload.single("avatar"), async (req, res) => {
  try {
    // prefer body fields (works for both JSON and multipart)
    const title = req.body.title;
    const body = req.body.body;
    if (!title || !body) return res.status(400).json({ message: "Title & body required" });

    // Build media array:
    // - If multipart upload provided a file, create media entry from it
    // - Else if client sent `media` (array) or `mediaUrl` (single) in JSON, use that
    let mediaArr = [];
    if (req.file) {
      mediaArr.push(`/uploads/${req.file.filename}`);
    } else if (req.body.media) {
      try {
        // allow media to be sent as JSON stringified or as array
        const parsed = typeof req.body.media === "string" ? JSON.parse(req.body.media) : req.body.media;
        mediaArr = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // if parse fails, fallback to treat as single string
        mediaArr = Array.isArray(req.body.media) ? req.body.media : [req.body.media];
      }
    } else if (req.body.mediaUrl) {
      mediaArr = [req.body.mediaUrl];
    }

    const post = await Post.create({
      title,
      body,
      author: req.user._id,
      media: mediaArr
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/posts/:id
 * Update post. Accepts:
 * - JSON body for simple updates
 * - multipart/form-data with optional 'avatar' to replace media
 */
router.put("/:id", auth, upload.single("avatar"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    // Update simple fields if provided
    post.title = req.body.title ?? post.title;
    post.body = req.body.body ?? post.body;

    // Handle media:
    if (req.file) {
      // replace media with uploaded file
      post.media = [`/uploads/${req.file.filename}`];
    } else if (req.body.media) {
      try {
        const parsed = typeof req.body.media === "string" ? JSON.parse(req.body.media) : req.body.media;
        post.media = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        post.media = Array.isArray(req.body.media) ? req.body.media : post.media;
      }
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/posts/:id
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });
    await post.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;



