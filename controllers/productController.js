const Joi = require("joi");
const Product = require("../models/productModel");
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
	category: Joi.string().valid("computing", "phones-and-tablets").required(),
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
});

const updateSchema = Joi.object({
	name: Joi.string().min(5).max(50),
	price: Joi.number().min(10),
	description: Joi.string().min(25).max(500),
	category: Joi.string().valid("computing", "phones-and-tablets"),
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
});

exports.getAllProducts = getMany(Product, "products");
exports.getProduct = getOne(Product, "product");
exports.createProduct = createOne(Product, "product", createSchema);
exports.updateProduct = updateOne(Product, "product", updateSchema);
exports.deleteProduct = deleteOne(Product, "product");

