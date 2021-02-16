const Joi = require("joi");

exports.create = Joi.object({
  name: Joi.string().min(5).max(50).required(),
  price: Joi.number().min(10).required(),
  description: Joi.string().min(25).max(500).required(),
  category: Joi.string().valid("computer", "phone and tablet").required(),
  discountPercentage: Joi.number(),
  shippedFromAbroad: Joi.boolean(),
  dealOffer: Joi.string(),
  ItemsInBox: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
    })
  ),
  ratingsQuantity: Joi.number(),
  ratingsAverage: Joi.number().min(1).max(5),
  imageCover: Joi.string().required(),
  images: Joi.string(),
  inStock: Joi.number(),
  _seller: Joi.string().required(),
});

exports.update = Joi.object({
  name: Joi.string().min(5).max(50),
  slug: Joi.string(),
  price: Joi.number().min(10),
  description: Joi.string().min(25).max(500),
  category: Joi.string().valid("computer", "phone and tablet"),
  discountPercentage: Joi.number(),
  shippedFromAbroad: Joi.boolean(),
  dealOffer: Joi.string(),
  ItemsInBox: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
    })
  ),
  ratingsQuantity: Joi.number(),
  ratingsAverage: Joi.number().min(1).max(5),
  imageCover: Joi.string(),
  images: Joi.string(),
  inStock: Joi.number(),
});
