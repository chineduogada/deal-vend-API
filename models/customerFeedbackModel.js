const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    review: { type: String },
    rating: {
      type: Number,
      required: [true, "`rating` is required"],
      min: [1.0, "`rating` can be '1.0' or more"],
      max: [5.0, "`rating` can be '5.0' or less"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "`user` is required"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "`product` is required"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const CustomerFeedback = mongoose.model("CustomerFeedback", schema);

export default CustomerFeedback;
