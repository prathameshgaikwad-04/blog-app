// server/src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");
// new upload route
const uploadRoutes = require("./routes/upload");

const app = express();

/* ---------- middleware ---------- */
app.use(express.json({ limit: "10mb" }));

/* ---------- CORS ---------- */
/* allow localhost dev and any deployed frontends (adjust/lock down for prod) */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_ORIGIN || "" // optionally set CLIENT_ORIGIN in env for production
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (e.g. curl, mobile)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // default reject — in production add your real origin
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

/* ---------- serve uploaded static files (server/uploads) ---------- */
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

/* ---------- DB ---------- */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog_app";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connect error:", err));

/* ---------- basic health route ---------- */
app.get("/", (req, res) => res.send("Blog API running"));

/* ---------- API routes (mount order matters) ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", usersRoutes);

// upload route: POST /api/avatar/upload
app.use("/api/avatar", uploadRoutes);

/* ---------- error handler (simple) ---------- */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  // if CORS rejected, send 403 with message
  if (err && err.message && err.message.includes("CORS")) {
    return res.status(403).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

/* ---------- start server ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


