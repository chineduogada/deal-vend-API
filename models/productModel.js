const mongoose = require("mongoose");
const slugify = require("slugify");

const schema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			required: [true, "`title` is required"],
		},
		price: {
			type: String,
			trim: true,
			required: [true, "`price` is required"],
		},
		description: {
			type: String,
			trim: true,
			required: [true, "`description` is required"],
		},
		category: {
			type: String,
			trim: true,
			enum: {
				value: ["computing", "phones-and-tablets"],
				validate:
					"`category` can be either 'computing' or 'phones-and-tablets'",
			},
			required: [true, "`category` is required"],
		},
		discountPercentage: Number,
		shippedFromAbroad: Boolean,
		dealOffer: String,
		ItemsInBox: {
			type: [
				{
					name: String,
					value: String,
				},
			],
		},
		ratingsQuantity: Number,
		ratingsAverage: {
			type: Number,
			min: [1.0, "`ratingsAverage` can be '1' or more"],
			max: [5.0, "`ratingsAverage` can be '5' or less"],
			default: 1.0,
		},
		imageCover: {
			type: String,
			trim: true,
			required: [true, "`imageCover` is required"],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now,
			select: false,
		},
		// _seller: {
		//   type: mongoose.S,
		// ref:
		// },
		// region: {
		//   type: {
		//     type: goeJSON
		//   }
		// }
		// specification: {
		// 	type: [
		// 		{
		// 			name: String,
		// 			value: String,
		// 		},
		// 	],
		// },
		// details: {
		// 	type: [
		// 		{
		// 			name: String,
		// 			value: String,
		// 		},
		// 	],
		// },
		// keyFeatures: {
		// 	type: [
		// 		{
		// 			name: String,
		// 			value: String,
		// 		},
		// 	],
		// },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

schema.virtual("slug").get(function () {
	return slugify(this.title);
});

const Product = mongoose.model("Product", schema);

module.exports = Product;

