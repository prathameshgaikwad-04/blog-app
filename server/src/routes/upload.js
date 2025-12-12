// server/src/routes/upload.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now().toString() + "-" + Math.random().toString(36).slice(2,9) + ext;
    cb(null, name);
  }
});

// file filter (images & videos)
const fileFilter = (req, file, cb) => {
  if (/^image\/|^video\//.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image and video files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post("/upload", upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // public URL path (server serves /uploads)
    const filePath = `/uploads/${req.file.filename}`;
    return res.json({ success: true, avatarUrl: filePath });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

module.exports = router;
