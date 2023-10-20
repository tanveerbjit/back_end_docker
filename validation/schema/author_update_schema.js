// author_update_schema.js

const { body, param } = require("express-validator");

module.exports = [
  param("id")
    .notEmpty()
    .withMessage("must need id parameter")
    .bail()
    .isMongoId() // Check if it's a valid MongoDB ObjectId
    .withMessage("Invalid id format")
    .bail(),
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Max length less than 301")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Min length must be greater than 1")
    .bail(),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Max length less than 301")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Min length must be greater than 1")
    .bail(),
  body("biography")
    .optional()
    .isString()
    .withMessage("Biography must be a string")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Max length less than 1001")
    .bail(),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Birth date must be a valid ISO8601 date format")
    .bail(),
];
