// server/src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim:true },
  email: { type: String, required: true, unique: true, trim:true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpires = Date.now() + (parseInt(process.env.RESET_PASSWORD_TTL || "3600000"));
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);


