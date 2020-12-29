const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const validateInput = require("../utils/validateInput");
const User = require("../models/userModel");
const { sendEmail } = require("../services/email");
const crypto = require("crypto");

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

	const error = validateInput(req.body, schema);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const existingUser = await User.findOne({ email: req.body.email }).select(
		"+password +email"
	);

	if (
		!existingUser ||
		!(await existingUser.isPasswordCorrect(
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

exports.protect = catchAsync(async (req, _res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.replace("Bearer ", "");
	}

	if (!token) {
		return next(
			new AppError(
				"You're not logged in! Please log in to gain access!",
				401
			)
		);
	}

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	const existingUser = await User.findById(decoded.id);

	if (!existingUser) {
		return next(
			new AppError(
				"The user whom this token was issued to, no longer exist! Please Login again.",
				401
			)
		);
	}

	if (existingUser.changePasswordAfterTokenWasIssued(decoded.iat)) {
		return next(
			new AppError(
				"User recently changed password! Please login a again.",
				401
			)
		);
	}

	req.user = existingUser;
	next();
});

exports.restrictTo = (...roles) =>
	catchAsync(async (req, _res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError("You are not permitted to perform this action!", 403)
			);
		}

		next();
	});

exports.changeMyPassword = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		currentPassword: Joi.string().min(8).required(),
		newPassword: Joi.string().min(8).required(),
		confirmPassword: Joi.ref("newPassword"),
	}).with("newPassword", "confirmPassword");

	const error = validateInput(req.body, schema);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const existingUser = await User.findById(req.user.id).select("+password");

	if (
		!(await existingUser.isPasswordCorrect(
			req.body.currentPassword,
			existingUser.password
		))
	) {
		return next(
			new AppError(
				"`currentPassword` is incorrect! Please cross-check and try again.",
				400
			)
		);
	}

	// Change password
	existingUser.password = req.body.newPassword;
	existingUser.passwordChangedAt = Date.now();
	await existingUser.save();

	// Login the user in
	const token = await signJWT({ user: req.user });

	res.status(200).json({
		status: "success",
		token,
	});
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		email: Joi.string().email().required(),
	});

	const error = validateInput(req.body, schema);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const existingUser = await User.findOne({ email: req.body.email });

	if (!existingUser) {
		return next(
			new AppError(
				"Unrecognized `email`! Please enter your correct `email`",
				400
			)
		);
	}
	const resetToken = existingUser.getResetToken();
	await existingUser.save();

	const resetUrl = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/users/auth/reset-password/${resetToken}`;

	const emailOptions = {
		to: req.body.email,
		subject: "Password Reset Token (valid for 10mins)",
		message: `Click here:${resetUrl} to reset your password. If you didn't wanted to change your password please ignore this email.`,
	};

	try {
		await sendEmail(emailOptions);

		res.status(200).json({
			status: "success",
			message:
				"A reset `email` has been successfully sent to you 'email-address'.",
		});
	} catch (err) {
		existingUser.passwordResetToken = undefined;
		existingUser.passwordResetTokenExpiresAt = undefined;
		await existingUser.save();

		next(
			new AppError(
				"Something went wrong while sending your `email`! Please try again."
			)
		);
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		newPassword: Joi.string().min(8).required(),
		confirmPassword: Joi.ref("newPassword"),
	}).with("newPassword", "confirmPassword");

	const error = validateInput(req.body, schema);
	if (error) {
		return next(new AppError(error.details[0].message, 400));
	}

	const resetToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	const existingUser = await User.findOne({
		passwordResetToken: resetToken,
		passwordResetTokenExpiresAt: { $gte: Date.now() },
	});

	if (!existingUser) {
		return next(new AppError("Invalid or expired reset token!"));
	}

	// set new password and clear every password data in the Document
	existingUser.password = req.body.newPassword;
	existingUser.passwordResetToken = undefined;
	existingUser.passwordResetTokenExpiresAt = undefined;
	await existingUser.save();

	const token = await signJWT({ user: existingUser });
	res.status(200).json({
		status: "success",
		token,
	});
});

