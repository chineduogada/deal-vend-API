const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const validateInput = require("../utils/validateInput");
const User = require("../models/userModel");

const signJWT = async ({ user, payload }) => {
	payload = user
		? {
				id: user.id,
				name: user.name,
				email: user.email,
		  }
		: payload;

	const token = await promisify(jwt.sign)(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES,
	});

	return token;
};

const validate = (req, next, schema) => {
	const error = validateInput(req.body, schema);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}
};

exports.signUp = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(25).required(),
		password: Joi.string().min(8).required(),
		confirmPassword: Joi.ref("password"),
		email: Joi.string().email().required(),
	}).with("password", "confirmPassword");

	validate(req, next, schema);

	let user = await User.create(req.body);
	user = {
		id: user.id,
		name: user.name,
		email: user.email,
	};

	const token = await signJWT({ payload: user });

	res.status(201).json({
		status: "success",
		token,
		data: {
			user,
		},
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		password: Joi.string().min(8).required(),
		email: Joi.string().email().required(),
	});

	validate(req, next, schema);

	const existingUser = await User.findOne({ email: req.body.email }).select(
		"+password +email"
	);

	if (
		!existingUser ||
		!(await existingUser.comparePasswords(
			req.body.password,
			existingUser.password
		))
	) {
		return next(new AppError("invalid `email` or `password`"));
	}

	const token = await signJWT({ user: existingUser });

	res.status(200).json({
		status: "success",
		token,
	});
});

