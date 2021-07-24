const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const validateInput = require("../utils/validateInput");
const User = require("../models/userModel");
const Email = require("../services/email");
const crypto = require("crypto");
const buildUrl = require("../utils/buildUrl");

const signJWT = async ({ user, payload }) => {
  payload = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    : payload;

  const token = await promisify(jwt.sign)(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  return { token, cookieOptions };
};

exports.inputEmailAddress = catchAsync(async (req, _res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const error = validateInput(req.body, schema);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const existingUser = await User.findOne({ email: req.body.email });

  if (!existingUser) {
    return next(
      new AppError(
        "Unrecognized `email`! Please enter your correct `email`",
        400
      )
    );
  }

  req.existingUser = existingUser;
  next();
});

exports.signUp = catchAsync(async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(25).required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.ref("password"),
    email: Joi.string().email().required(),
  }).with("password", "confirmPassword");

  const error = validateInput(req.body, schema);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  let user = await User.create(req.body);
  user = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  const { token, cookieOptions } = await signJWT({ payload: user });

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });

  await new Email(user, `http://not-yet-implemented`).welcome();
});

exports.login = catchAsync(async (req, res, next) => {
  const existingUser = await User.findOne({ email: req.body.email }).select(
    "+password +email"
  );

  if (
    !existingUser ||
    !(await existingUser.isPasswordCorrect(
      req.body.password,
      existingUser.password
    ))
  ) {
    return next(new AppError("invalid `email` or `password`", 400));
  }

  if (existingUser.passwordResetToken) {
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetTokenExpiresAt = undefined;
    await existingUser.save();
  }

  const { token, cookieOptions } = await signJWT({ user: existingUser });

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.logout = catchAsync(async (_req, res) => {
  res.clearCookie();

  res.status(200).json({
    status: "success",
  });
});

exports.protect = catchAsync(async (req, _res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")) ||
    res.cookies.token
  ) {
    token = req.headers.authorization.replace("Bearer ", "");
  }

  if (!token) {
    return next(
      new AppError("You're not logged in! Please log in to gain access!", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const existingUser = await User.findById(decoded.id);

  if (!existingUser) {
    return next(
      new AppError(
        "The user whom this token was issued to, no longer exist! Please Login again.",
        401
      )
    );
  }

  if (existingUser.changePasswordAfterTokenWasIssued(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login a again.", 401)
    );
  }

  req.user = existingUser;
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not permitted to perform this action!", 403)
      );
    }

    next();
  });

exports.changeMyPassword = catchAsync(async (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().min(8).required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.ref("newPassword"),
  }).with("newPassword", "confirmPassword");

  const error = validateInput(req.body, schema);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const existingUser = await User.findById(req.user.id).select("+password");

  if (
    !(await existingUser.isPasswordCorrect(
      req.body.currentPassword,
      existingUser.password
    ))
  ) {
    return next(
      new AppError(
        "`currentPassword` is incorrect! Please cross-check and try again.",
        400
      )
    );
  }

  // Change password
  existingUser.password = req.body.newPassword;
  await existingUser.save();

  // Login the user in
  const { token, cookieOptions } = await signJWT({ user: req.user });

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { existingUser } = req;

  const resetToken = existingUser.getResetToken();
  await existingUser.save();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/auth/reset-password/${resetToken}`;

  try {
    await new Email(existingUser, resetUrl).resetPassword();

    res.status(200).json({
      status: "success",
      message:
        "A reset `email` has been successfully sent to you 'email-address'.",
    });
  } catch (err) {
    console.log(err);

    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetTokenExpiresAt = undefined;
    await existingUser.save();

    next(
      new AppError(
        "Something went wrong while sending your `email`! Please try again."
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const schema = Joi.object({
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.ref("newPassword"),
  }).with("newPassword", "confirmPassword");

  const error = validateInput(req.body, schema);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const existingUser = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpiresAt: { $gte: Date.now() },
  });

  if (!existingUser) {
    return next(new AppError("Invalid or expired reset token!"));
  }

  // set new password and clear every password data in the Document
  existingUser.password = req.body.newPassword;
  existingUser.passwordResetToken = undefined;
  existingUser.passwordResetTokenExpiresAt = undefined;

  await existingUser.save();

  const { token, cookieOptions } = await signJWT({ user: existingUser });

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { existingUser } = req;
  const token = existingUser.getEmailConfirmToken();
  await existingUser.save();

  const url = buildUrl(
    req,
    `/api/v1/users/auth/confirm-email-verification/${token}`
  );

  try {
    await new Email(existingUser, url).verifyEmail();

    res.status(200).json({
      status: "success",
      message:
        "An `email` confirmation has been successfully sent to you 'email-address'.",
    });
  } catch (err) {
    console.log(err);

    existingUser.emailConfirmToken = undefined;
    existingUser.emailConfirmTokenExpiresAt = undefined;
    await existingUser.save();

    next(
      new AppError(
        "Something went wrong while sending your `email`! Please try again."
      )
    );
  }
});

exports.confirmEmailVerification = catchAsync(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const existingUser = await User.findOne({
    emailConfirmToken: token,
    emailConfirmTokenExpiresAt: { $gte: Date.now() },
  });

  if (!existingUser) {
    return next(new AppError("Invalid or expired `email verification token`!"));
  }

  existingUser.emailConfirmToken = undefined;
  existingUser.emailConfirmTokenExpiresAt = undefined;
  existingUser.emailVerified = true;

  await existingUser.save();

  res.status(200).json({
    status: "success",
    message: "Your `email` has been successfully verified.",
  });
});

exports.deactivateAccount = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(200).json({
    status: "success",
    data: null,
    message: "Your account has been successfully deactivated",
  });
});
