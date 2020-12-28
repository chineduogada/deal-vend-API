const Joi = require("joi");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const validateInput = require("../utils/validateInput");
const User = require("../models/userModel");

exports.signUp = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(25).required(),
		password: Joi.string().min(8).required(),
		confirmPassword: Joi.ref("password"),
		email: Joi.string().email().required(),
	}).with("password", "confirmPassword");

	const error = validateInput(req.body, schema);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	let user = await User.create(req.body);
	user = {
		name: user.name,
		email: user.email,
	};

	const token = "11234567890";

	res.status(201).json({
		status: "success",
		token,
		data: {
			user,
		},
	});
});

