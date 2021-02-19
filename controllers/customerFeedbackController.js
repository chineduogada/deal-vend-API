const CustomerFeedback = require("../models/customerFeedbackModel");
const schema = require("../schema/customerFeedbackSchema");
const {
  getMany,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handleFactory");

exports.getAllFeedbacks = [
  (req, _res, next) => {
    req.filterOptions = {
      _product: req.params.productId,
    };

    next();
  },
  getMany(CustomerFeedback, "customerFeedbacks"),
];

exports.getFeedback = getOne(CustomerFeedback, "customerFeedback");

exports.createFeedback = [
  (req, _res, next) => {
    req.body = {
      ...req.body,
      _product: req.params.productId,
      _user: req.user.id,
    };

    next();
  },
  createOne(CustomerFeedback, "customerFeedback", schema.create),
];

exports.updateFeedback = updateOne(
  CustomerFeedback,
  "customerFeedback",
  schema.update
);
exports.deleteFeedback = deleteOne(CustomerFeedback, "customerFeedback");
