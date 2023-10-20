// publisher_schema.js

const { body } = require("express-validator");

module.exports = [
  body("name")
    .notEmpty()
    .withMessage("Name must be filled")
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
    .notEmpty()
    .withMessage("Location must be filled")
    .isString()
    .withMessage("Location must be a string")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Max length less than 301")
    .bail(),
  body("foundingYear")
    .notEmpty()
    .withMessage("Founding year must be filled")
    .isNumeric()
    .withMessage("Founding year must be a number")
    .bail(),
];
