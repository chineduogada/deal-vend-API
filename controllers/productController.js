const Product = require("../models/productModel");
const {
  getMany,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require("./handleFactory");
const schema = require("../schema/productSchema");

// Middleware helpers
const beforeUpdateAndDelete = (req, _res, next) => {
  req.filterOptions = { slug: req.params.slug, _seller: req.user.id };

  next();
};
// EndOf Middleware helpers

// Primary controllers
exports.createProduct = [
  (req, _res, next) => {
    req.body = {
      ...req.body,
      _seller: req.user.id,
    };

    next();
  },
  createOne(Product, "product", schema.create),
];

exports.deleteProduct = [beforeUpdateAndDelete, deleteOne(Product, "product")];

exports.getAllProducts = getMany(Product, "products");

exports.getProduct = [
  (req, _res, next) => {
    req.filterOptions = { slug: req.params.slug };

    next();
  },
  getOne(Product, "product"),
];

exports.updateProduct = [
  beforeUpdateAndDelete,
  updateOne(Product, "product", schema.update),
];
// EndOf Primary controllers

// Secondary controllers
exports.dealsOfTheDay = [
  (req, _res, next) => {
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
  },
  this.getAllProducts,
];

exports.topCheap = [
  (req, _res, next) => {
    req.query = {
      ...req.query,
      inStock: { gte: 1 },
      sort: "-ratingsAverage,price",
      limit: 10,
    };

    next();
  },
  this.getAllProducts,
];

exports.mostSearched = [
  (req, _res, next) => {
    req.query = {
      ...req.query,
      inStock: { gte: 1 },
      sort: "-searchCount,-ratingsAverage",
      limit: req.query.limit || 10,
    };

    next();
  },
  this.getAllProducts,
];

exports.topSales = [
  (req, _res, next) => {
    req.query = {
      ...req.query,
      inStock: { gte: 1 },
      sort: "-salesCount",
      limit: 10,
    };

    next();
  },
  this.getAllProducts,
];
// EndOf Secondary controllers
