// publisher_update_schema.js

const { body, param } = require("express-validator");

module.exports = [
  param("id")
    .notEmpty()
    .withMessage("Must provide an id parameter")
    .bail()
    .isMongoId()
    .withMessage("Invalid id format")
    .bail(),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Max length less than 301")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Min length must be greater than 1")
    .bail(),
  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Max length less than 301")
    .bail(),
  body("foundingYear")
    .optional()
    .isNumeric()
    .withMessage("Founding year must be a number")
    .bail(),
];
