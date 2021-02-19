const CustomerFeedback = require("../models/customerFeedbackModel");
const schema = require("../schema/customerFeedbackSchema");
const {
  getMany,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handleFactory");
// const Joi = require("joi");
// const AppError = require("../utils/AppError");
// const catchAsync = require("../utils/catchAsync");

exports.getAllFeedbacks = getMany(CustomerFeedback, "customerFeedbacks");
exports.getFeedback = getOne(CustomerFeedback, "customerFeedback");
exports.createFeedback = createOne(
  CustomerFeedback,
  "customerFeedback",
  schema.create
);
exports.updateFeedback = updateOne(
  CustomerFeedback,
  "customerFeedback",
  schema.update
);
exports.deleteFeedback = deleteOne(CustomerFeedback, "customerFeedback");
