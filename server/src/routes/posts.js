// server/src/routes/posts.js
const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", async (req,res)=> {
  try {
    const posts = await Post.find().populate("author","username").sort({createdAt:-1});
    res.json(posts);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.get("/:id", async (req,res)=> {
  try {
    const p = await Post.findById(req.params.id).populate("author","username");
    if(!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.post("/", auth, async (req,res)=> {
  try {
    const { title, body, media } = req.body;
    if (!title || !body) return res.status(400).json({ message: "Title & body required" });
    const post = await Post.create({ title, body, author: req.user._id, media: Array.isArray(media)?media:[] });
    res.status(201).json(post);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.put("/:id", auth, async (req,res)=> {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });
    post.title = req.body.title ?? post.title;
    post.body = req.body.body ?? post.body;
    post.media = Array.isArray(req.body.media) ? req.body.media : post.media;
    await post.save();
    res.json(post);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.delete("/:id", auth, async (req,res)=> {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });
    await post.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// user posts (history)
router.get("/user/:userId", auth, async (req,res)=> {
  try {
    if(req.user._id.toString() !== req.params.userId) return res.status(403).json({ message: "Not authorized" });
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt:-1 });
    res.json(posts);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

module.exports = router;


