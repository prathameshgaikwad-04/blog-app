// server/src/models/Post.js
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  data: String,
  mimeType: String
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  media: [mediaSchema]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);

