const Joi = require("joi");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const {
  getMany,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require("./handleFactory");

const createSchema = Joi.object({
  name: Joi.string().min(5).max(50).required(),
  price: Joi.number().min(10).required(),
  description: Joi.string().min(25).max(500).required(),
  category: Joi.string().valid("computer", "phone and tablet").required(),
  discountPercentage: Joi.number(),
  shippedFromAbroad: Joi.boolean(),
  dealOffer: Joi.string(),
  ItemsInBox: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
    })
  ),
  ratingsQuantity: Joi.number(),
  ratingsAverage: Joi.number().min(1).max(5),
  imageCover: Joi.string().required(),
  images: Joi.string(),
  inStock: Joi.number(),
  _seller: Joi.string().required(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(5).max(50),
  slug: Joi.string(),
  price: Joi.number().min(10),
  description: Joi.string().min(25).max(500),
  category: Joi.string().valid("computer", "phone and tablet"),
  discountPercentage: Joi.number(),
  shippedFromAbroad: Joi.boolean(),
  dealOffer: Joi.string(),
  ItemsInBox: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
    })
  ),
  ratingsQuantity: Joi.number(),
  ratingsAverage: Joi.number().min(1).max(5),
  imageCover: Joi.string(),
  images: Joi.string(),
  inStock: Joi.number(),
});

exports.topSales = catchAsync(async (req, _res, next) => {
  req.query = {
    ...req.query,
    inStock: { gte: 1 },
    sort: "-salesCount",
    limit: 10,
  };

  next();
});

exports.topCheap = catchAsync(async (req, _res, next) => {
  req.query = {
    ...req.query,
    inStock: { gte: 1 },
    sort: "-ratingsAverage,price",
    limit: 10,
  };

  next();
});

exports.dealsOfTheDay = catchAsync(async (req, _res, next) => {
  const now = new Date();

  req.query = {
    ...req.query,
    inStock: { gte: 1 },
    createdAt: {
      gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    },
    limit: req.query.limit || 10,
  };

  next();
});

exports.mostSearched = catchAsync(async (req, _res, next) => {
  req.query = {
    ...req.query,
    inStock: { gte: 1 },
    sort: "-searchCount,-ratingsAverage",
    limit: req.query.limit || 10,
  };

  next();
});

// Middlewares
exports.beforeCreateProduct = (req, _res, next) => {
  req.body._seller = req.user.id;

  next();
};
exports.beforeUpdateProduct = (req, _res, next) => {
  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }

  next();
};

exports.getAllProducts = getMany(Product, "products");
exports.createProduct = createOne(Product, "product", createSchema);
exports.getProduct = getOne(Product, "product", "slug");
exports.updateProduct = updateOne(Product, "product", updateSchema, "slug");
exports.deleteProduct = deleteOne(Product, "product", "slug");
