const Joi = require("joi");

// The client can edit article content, but author/userId are assigned by the API.
const articleSchema = Joi.object({
  title: Joi.string().min(5).trim().required(),
  content: Joi.string().min(20).trim().required(),
}).unknown(false);

const validateArticle = (req, res, next) => {
  const { error, value } = articleSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  return next();
};

module.exports = validateArticle;
