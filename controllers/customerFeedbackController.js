const Joi = require("joi");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const CustomerFeedback = require("../models/customerFeedbackModel");
const validateInput = require("../utils/validateInput");

exports.getAllFeedbacks = catchAsync(async (req, res, next) => {
  const feedbacks = await CustomerFeedback.find();

  res.status(200).json({
    status: "success",
    results: feedbacks.length,
    data: {
      feedbacks,
    },
  });
});

exports.createFeedback = catchAsync(async (req, res, next) => {
  const schema = Joi.object({
    product: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    review: Joi.string().max(250),
  });

  const error = validateInput(req.body, schema);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = { ...req.body, user: req.user.id };
  const filterObject = {
    product: req.body.product,
    user: req.body.user,
  };

  const existingFeedback = await CustomerFeedback.findOne(filterObject);

  let feedback;
  if (existingFeedback) {
    feedback = await CustomerFeedback.findOneAndReplace(
      filterObject,
      req.body,
      { new: true, runValidators: true }
    );
  } else {
    feedback = await CustomerFeedback.create(req.body);
  }

  res.status(201).json({
    status: "success",
    data: {
      feedback,
    },
  });
});
