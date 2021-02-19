const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const schema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  bio: {
    type: String,
    trim: true,
    minlength: [10, "`bio` can be '10' or more characters"],
    maxlength: [30, "`bio` can be '30' or less characters"],
  },
  createAt: {
    type: Date,
    select: false,
    default: Date.now,
  },
  email: {
    type: String,
    validate: [validator.isEmail, "`email` must be valid"],
    required: [true, "`email` is required"],
    unique: true,
    lowercase: true,
  },
  emailConfirmToken: String,
  emailConfirmTokenExpiresAt: Date,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: [true, "`name` is required"],
    minlength: [3, "`name` can be '3' or more characters"],
    maxlength: [25, "`name` can be '25' or less characters"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "`password` is required"],
    minlength: [8, "`password` can be '8' or more characters"],
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
  photo: String,
  role: {
    type: String,
    enum: {
      // "supplier", "customer"
      values: ["buyer", "seller", "admin"],
      validate: "`category` can be either 'buyer', 'seller' or 'admin'",
    },
    default: "buyer",
  },
  sellerAccount: Boolean,
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

schema.pre("save", function (next) {
  if (this.isNew || !this.isModified("password")) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

schema.methods.isPasswordCorrect = async function (
  plainPassword,
  hashPassword
) {
  return await bcrypt.compare(plainPassword, hashPassword);
};

schema.pre(/^find/, function (next) {
  // `this` points to the current `query`
  this.find({ active: true });
  next();
});

schema.pre("findOneAndUpdate", async function (next) {
  let emailModified;

  for (key in this._update) {
    if (key === "email") {
      emailModified = this._update.email;
    }
  }

  if (!emailModified) return next();

  const doc = await this.findOne();
  doc.emailVerified = false;
  await doc.save();

  next();
});

schema.methods.changePasswordAfterTokenWasIssued = function (tokenIssuedAt) {
  if (this.passwordChangedAt) {
    const passwordChangedAt = parseInt(this.passwordChangedAt.getTime() / 1000);

    return passwordChangedAt > tokenIssuedAt;
  }
};

schema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetToken = hashResetToken;
  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

schema.methods.getEmailConfirmToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  console.log("hit");

  this.emailConfirmToken = tokenHash;
  this.emailConfirmTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  console.log("hit_ted");
  return token;
};

const User = mongoose.model("User", schema);
module.exports = User;
