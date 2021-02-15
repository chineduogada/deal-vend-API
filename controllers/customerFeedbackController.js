const Joi = require("joi");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const CustomerFeedback = require("../models/customerFeedbackModel");
const validateInput = require("../utils/validateInput");

exports.getAllFeedbacks = catchAsync(async (req, res, _next) => {
  const customerFeedbacks = await CustomerFeedback.find({
    _product: req.params.productId,
  });

  res.status(200).json({
    status: "success",
    results: customerFeedbacks.length,
    data: {
      customerFeedbacks,
    },
  });
});

exports.getFeedback = catchAsync(async (req, res, next) => {
  const { id, productId } = req.params;

  const customerFeedback = await CustomerFeedback.findOne({
    _id: id,
    _product: productId,
  });

  if (!customerFeedback) {
    return next(new AppError("not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      customerFeedback,
    },
  });
});

exports.createFeedback = catchAsync(async (req, res, next) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    review: Joi.string().max(250),
  });

  const error = validateInput(req.body, schema);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = {
    ...req.body,
    _product: req.params.productId,
    _user: req.user.id,
  };
  const filterObject = {
    _product: req.body._product,
    _user: req.body._user,
  };

  const existingFeedback = await CustomerFeedback.findOne(filterObject);

  let customerFeedbacks;
  if (existingFeedback) {
    customerFeedbacks = await CustomerFeedback.findOneAndReplace(
      filterObject,
      req.body,
      { new: true, runValidators: true }
    );
  } else {
    customerFeedbacks = await CustomerFeedback.create(req.body);
  }

  res.status(201).json({
    status: "success",
    data: {
      customerFeedbacks,
    },
  });
});
