const Joi = require("joi");
const Product = require("../models/productModel");
const {
	getMany,
	getOne,
	createOne,
	deleteOne,
	updateOne,
} = require("./handleFactory");

const productSchema = Joi.object({
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

exports.getAllProducts = getMany(Product, "products");
exports.getProduct = getOne(Product, "product");
exports.createProduct = createOne(Product, "product", productSchema);
exports.updateProduct = updateOne(Product, "product");
exports.deleteProduct = deleteOne(Product, "product");

