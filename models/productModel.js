const mongoose = require("mongoose");
const slugify = require("slugify");
const { validate } = require("./customerFeedbackModel");

const schema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: {
        values: ["computer", "phone and tablet"],
        validate: "`category` can be either 'computer' or 'phone and tablet'",
      },
      required: [true, "`category` is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    dealOffer: String,
    description: {
      type: String,
      trim: true,
      required: [true, "`description` is required"],
      minlength: [20, "`title` can be '20' or more characters"],
      maxlength: [500, "`title` can be '500' or less characters"],
    },
    discount: { type: Number, default: 10 },
    imageCover: {
      type: String,
      trim: true,
      required: [true, "`imageCover` is required"],
    },
    images: [String],
    inStock: {
      type: Number,
      default: 1,
    },
    ItemsInBox: {
      type: [
        {
          name: String,
          value: String,
        },
      ],
    },
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
    ratingsAverage: {
      type: Number,
      min: [1.0, "`ratingsAverage` can be '1' or more"],
      max: [5.0, "`ratingsAverage` can be '5' or less"],
      default: 1.0,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number },
    shippedFromAbroad: Boolean,
    salesCount: {
      type: Number,
    },
    searchCount: {
      type: Number,
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

// adds child referencing to CustomerFeedback virtually
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

schema.post("findOneAndUpdate", async function () {
  const product = await this.findOne();
  product.slug = slugify(product.name);

  await product.save();
});

const Product = mongoose.model("Product", schema);

module.exports = Product;
