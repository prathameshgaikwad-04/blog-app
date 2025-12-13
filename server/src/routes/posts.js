const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const router = express.Router();

/* ---------- upload setup ---------- */
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.random().toString(36).slice(2) + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\/|^video\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image/video allowed"));
  }
});

/* ---------- ROUTES ---------- */

/* ✅ USER POSTS — MUST BE FIRST */
router.get("/user/:userId", auth, async (req, res) => {
  if (req.user._id.toString() !== req.params.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }
  const posts = await Post.find({ author: req.params.userId })
    .sort({ createdAt: -1 })
    .populate("author", "username");
  res.json(posts);
});

/* GET ALL */
router.get("/", async (_, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("author", "username");
  res.json(posts);
});

/* GET ONE */
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "username");
  if (!post) return res.status(404).json({ message: "Not found" });
  res.json(post);
});

/* CREATE */
router.post("/", auth, upload.single("avatar"), async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ message: "Missing fields" });

  const media = [];
  if (req.file) {
    media.push({
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith("image") ? "image" : "video"
    });
  }

  const post = await Post.create({
    title,
    body,
    author: req.user._id,
    media
  });

  res.status(201).json(post);
});

/* UPDATE */
router.put("/:id", auth, upload.single("avatar"), async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Not found" });
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  post.title = req.body.title ?? post.title;
  post.body = req.body.body ?? post.body;

  if (req.file) {
    post.media = [{
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith("image") ? "image" : "video"
    }];
  }

  await post.save();
  res.json(post);
});

/* DELETE */
router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Not found" });
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  await post.deleteOne();
  res.json({ message: "Deleted" });
});

module.exports = router;






