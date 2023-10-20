const { body } = require("express-validator");

module.exports = [
  body("first_name")
    .optional()
    .isString()
    .withMessage("First Name must be a string")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Name must be less than 51 characters")
    .bail(),
  body("last_name")
    .optional()
    .isString()
    .withMessage("Last Name must be a string")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Name must be less than 51 characters")
    .bail(),
  body("phone")
    .optional()
    .isString()
    .withMessage("phone must be  11 digit")
    .bail()
    .isLength({ min: 11,max:11 })
    .withMessage("Name must be less than 51 characters")
    .bail(),
  body("address")
    .optional()
    .isString()
    .withMessage("address must be a string")
    .bail()
    .isLength({ max: 250 })
    .withMessage("address must be less than 251 characters")
    .bail(),
];
