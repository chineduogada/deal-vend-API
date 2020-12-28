const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const validateInput = require("../utils/validateInput");
const User = require("../models/userModel");

const signJWT = async (payload) => {
	const token = await promisify(jwt.sign)(payload, process.env.JWT_SECRET);

	return token;
};

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
		id: user.id,
		name: user.name,
		email: user.email,
	};

	const token = await signJWT(user);

	res.status(201).json({
		status: "success",
		token,
		data: {
			user,
		},
	});
});

