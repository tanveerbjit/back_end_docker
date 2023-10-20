// author_schema.js

const { body } = require("express-validator");

module.exports = [
  body("firstName")
    .notEmpty()
    .withMessage("First name must be filled")
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
    .notEmpty()
    .withMessage("Last name must be filled")
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
