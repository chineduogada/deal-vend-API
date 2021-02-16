exports.beforeCreateProduct = (req, _res, next) => {
  req.body = {
    ...req.body,
    slug: slugify(req.body.name),
    _seller: req.user.id,
  };

  next();
};

exports.beforeUpdateProduct = (req, _res, next) => {
  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }

  next();
};
