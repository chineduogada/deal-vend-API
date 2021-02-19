const CustomerFeedback = require("../models/customerFeedbackModel");
const schema = require("../schema/customerFeedbackSchema");
const {
  getMany,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handleFactory");

// Middleware helpers
const beforeUpdateAndDelete = (req, _res, next) => {
  req.filterOptions = { _id: req.params.id, _user: req.user.id };

  next();
};
// EndOf Middleware helpers

// Primary controllers
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

exports.deleteFeedback = [
  beforeUpdateAndDelete,
  deleteOne(CustomerFeedback, "customerFeedback"),
];

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

exports.updateFeedback = [
  beforeUpdateAndDelete,
  updateOne(CustomerFeedback, "customerFeedback", schema.update),
];
// EndOf Primary controllers
