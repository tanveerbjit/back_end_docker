const { validationResult } = require("express-validator");

const product_schema_validation = function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      failure: true,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = product_schema_validation;
