const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "`name` is required"],
		minlength: [3, "`name` can be '3' or more characters"],
		maxlength: [25, "`name` can be '25' or less characters"],
		trim: true,
	},
	password: {
		type: String,
		required: [true, "`password` is required"],
		minlength: [8, "`name` can be '8' or more characters"],
		select: false,
	},
	email: {
		type: String,
		validate: [validator.isEmail, "`email` must be valid"],
		required: [true, "`email` is required"],
		unique: true,
		lowercase: true,
		select: false,
	},
	photo: String,
	bio: {
		type: String,
		trim: true,
		minlength: [10, "`name` can be '10' or more characters"],
		maxlength: [20, "`name` can be '20' or less characters"],
	},
	role: {
		type: String,
		enum: {
			values: ["buyer", "seller", "admin"],
			validate: "`category` can be either 'buyer', 'seller' or 'admin'",
		},
		default: "buyer",
	},
	createAt: {
		type: Date,
		select: false,
		default: Date.now,
	},
});

schema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);

	next();
});

const User = mongoose.model("User", schema);
module.exports = User;

