// server/src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");

const app = express();

/* ======================================================
   MIDDLEWARE
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   CORS — STABLE FOR LOCAL + RENDER + PROD
====================================================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_ORIGIN // e.g. https://frontend.onrender.com
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, mobile apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(" CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

/* ======================================================
   STATIC FILES (UPLOADED MEDIA)
====================================================== */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

/* ======================================================
   DATABASE CONNECTION
====================================================== */
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog_app";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get("/", (req, res) => {
  res.send("🚀 Blog API running");
});

/* ======================================================
   API ROUTES
====================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", usersRoutes);

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */
app.use((err, req, res, next) => {
  console.error(" Server Error:", err.message);

  // CORS specific error
  if (err.message?.includes("CORS")) {
    return res.status(403).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

/* ======================================================
   START SERVER
====================================================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


