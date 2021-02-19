const Joi = require("joi");
const User = require("../models/userModel");
const filterRequestBody = require("../utils/filterRequestBody");
const validateInput = require("../utils/validateInput");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const factory = require("./handleFactory");

const updateSchema = Joi.object({
  name: Joi.string().min(3).max(25),
  email: Joi.string().email(),
  bio: Joi.string().min(10).max(30),
});

exports.createUser = catchAsync(async (_req, _res, next) => {
  return next(
    new AppError(
      "This route is not defined! Please use `/api/v1/users/auth/signup` instead."
    )
  );
});
exports.getMe = [
  (req, _res, next) => {
    req.params.id = req.user.id;

    next();
  },
  factory.getOne(User, "user"),
];
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Throw an Error if password data is POSTed
  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for Password updates! Please use `api/v1/users/auth/change-password` instead.",
        400
      )
    );
  }

  const error = validateInput(req.body, updateSchema);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  // // 2. Filtered unwanted fields that should be updated this way
  const filteredBody = filterRequestBody(req.body, "name", "email", "bio");

  // if (req.file) {
  // 	filteredBody.photo = req.file.filename;
  // }

  // 2. update User document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getAllUsers = factory.getMany(User, "users");
exports.getUser = factory.getOne(User, "user");
exports.updateUser = factory.updateOne(User, "user", updateSchema);
exports.deleteUser = factory.deleteOne(User, "user");
exports.createSellerAccount = [
  (req, _res, next) => {
    req.body = { role: "seller", sellerAccount: true };
    req.params.id = req.user.id;

    next();
  },
  factory.updateOne(User, "user"),
];
