require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
// users routes (stats etc.)
const usersRoutes = require("./routes/users");

const app = express();

/* ---------- middleware ---------- */
app.use(express.json({ limit: "10mb" }));

// adjust origin if your client is served from a different address
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

/* ---------- serve uploaded static files (if you store uploads in server/uploads) ---------- */
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
app.use("/api/users", usersRoutes); // <- new: user stats route

/* ---------- error handler (simple) ---------- */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

/* ---------- start server ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

