const Joi = require("joi");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");

exports.getAllProducts = catchAsync(async (req, res) => {
	const apiFeatures = new APIFeatures(Product.find(), req.query)
		.filter()
		.sort()
		.paginate()
		.project();

	const products = await apiFeatures.Query;

	res.status(200).json({
		status: "success",
		results: products.length,
		data: {
			products,
		},
	});
});

exports.createProduct = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string().min(5).max(25).required(),
		price: Joi.number().min(10).required(),
		description: Joi.string().min(25).max(500).required(),
		category: Joi.string()
			.valid("computing", "phones-and-tablets")
			.required(),
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
	const { error } = schema.validate(req.body);

	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const product = await Product.create(req.body);

	res.status(201).json({
		status: "success",
		data: {
			product,
		},
	});
});

