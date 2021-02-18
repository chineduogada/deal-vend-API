const mongoose = require("mongoose");
const Product = require("./productModel");

const schema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      required: [true, "`rating` is required"],
      min: [1.0, "`rating` can be '1.0' or more"],
      max: [5.0, "`rating` can be '5.0' or less"],
    },
    review: { type: String },
    _product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "`_product` is required"],
    },
    _user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "`_user` is required"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.pre(/^find/, function (next) {
  // this = query e.g Model.find()

  this.populate({
    path: "_user",
    select: "name photo",
  });

  next();
});

schema.statics.calcRatingStats = async function (_product) {
  const stats = await this.aggregate([
    {
      $match: { _product },
    },
    {
      $group: {
        _id: "$_product",
        avgRating: { $avg: "$rating" },
        nRating: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(
    _product,
    {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    },
    { runValidators: true }
  );
};

schema.post("save", function () {
  // this = document
  // this.constructor = Model
  const product = this;

  product.constructor.calcRatingStats(product._product);
});
schema.pre(/^findOneAnd/, async function (next) {
  // this = Query
  // USE: await this.findOne = the document to be updated or deleted

  this.product = await this.findOne();

  next();
});
schema.post(/^findOneAnd/, function () {
  // this = Query
  // DON"T USE: await this.findOne = the `updated document`, and `null`:(deleted document)
  // USE: this.product = the document to be updated or deleted
  const { product } = this;

  product.constructor.calcRatingStats(product._product);
});

const CustomerFeedback = mongoose.model("CustomerFeedback", schema);
module.exports = CustomerFeedback;
