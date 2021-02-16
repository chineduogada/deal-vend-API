const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const {
  getMany,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require("./handleFactory");
const schema = require("../schema/productSchema");

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

exports.getAllProducts = getMany(Product, "products");
exports.createProduct = createOne(Product, "product", schema.create);
exports.getProduct = getOne(Product, "product", "slug");
exports.updateProduct = updateOne(Product, "product", schema.update, "slug");
exports.deleteProduct = deleteOne(Product, "product", "slug");
