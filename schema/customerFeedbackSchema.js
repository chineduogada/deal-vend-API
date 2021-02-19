const Joi = require("joi");

exports.create = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().max(250),
  _product: Joi.string(),
  _user: Joi.string(),
});
exports.update = Joi.object({
  rating: Joi.number().min(1).max(5),
  review: Joi.string().max(250),
});
