const mongoose = require("mongoose");

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
  this
    // .populate({ path: "_product", select: "name" })
    .populate({
      path: "_user",
      select: "name photo",
    });

  next();
});

const CustomerFeedback = mongoose.model("CustomerFeedback", schema);
module.exports = CustomerFeedback;
