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

  next();
});
