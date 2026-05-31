const Joi = require('joi');

const cropSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
  location: Joi.string().required(),
  description: Joi.string().allow('').optional(),  // ← add karo
});

module.exports = cropSchema;