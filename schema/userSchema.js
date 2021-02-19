const Joi = require("joi");

exports.update = Joi.object({
  name: Joi.string().min(3).max(25),
  email: Joi.string().email(),
  bio: Joi.string().min(10).max(30),
});
