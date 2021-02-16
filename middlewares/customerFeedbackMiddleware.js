const CustomerFeedback = require("../models/customerFeedbackModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.beforeGetAllFeedbacks = (req, _res, next) => {
  req.filterOptions = {
    _product: req.params.productId,
  };

  next();
};

exports.beforeCreateFeedback = catchAsync(async (req, _res, next) => {
  req.body = {
    ...req.body,
    _product: req.params.productId,
    _user: req.user.id,
  };

  const filterOptions = {
    _product: req.body._product,
    _user: req.body._user,
  };

  const existingFeedback = await CustomerFeedback.findOne(filterOptions);

  console.log(existingFeedback, filterOptions);

  if (existingFeedback) {
    return next(
      new AppError(
        "You have already reviewed on this `product`! Please update or delete previous `review` on this `product`."
      )
    );
  }

  next();
});
