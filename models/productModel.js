const mongoose = require("mongoose");
const slugify = require("slugify");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "`name` is required"],
      minlength: [5, "`name` can be '5' or more characters"],
      maxlength: [50, "`name` can be '50' or less characters"],
    },
    price: {
      type: Number,
      trim: true,
      required: [true, "`price` is required"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "`description` is required"],
      minlength: [20, "`title` can be '20' or more characters"],
      maxlength: [500, "`title` can be '500' or less characters"],
    },
    category: {
      type: String,
      enum: {
        values: ["computer", "phone and tablet"],
        validate: "`category` can be either 'computer' or 'phone and tablet'",
      },
      required: [true, "`category` is required"],
    },
    shippedFromAbroad: Boolean,
    dealOffer: String,
    discount: { type: Number, default: 10 },
    ItemsInBox: {
      type: [
        {
          name: String,
          value: String,
        },
      ],
    },
    ratingsQuantity: { type: Number, default: 0 },
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
    inStock: {
      type: Number,
      default: 1,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    searchCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      default: function () {
        return slugify(this.name);
      },
    },
    _seller: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "`_seller` is required"],
    },
    // region: {
    //   type: {
    //     type: String
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

schema.index({ slug: 1 });

// Virtual Populate
schema.virtual("customerFeedbacks", {
  foreignField: "_product",
  localField: "_id",
  ref: "CustomerFeedback",
});

schema.pre("findOne", function (next) {
  this.populate({
    path: "_seller",
    select: "name photo",
  }).populate({
    path: "customerFeedbacks",
  });

  next();
});

const Product = mongoose.model("Product", schema);

module.exports = Product;
