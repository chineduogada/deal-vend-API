exports.beforeCreateProduct = (req, _res, next) => {
  req.body = {
    ...req.body,
    _seller: req.user.id,
  };

  next();
};
