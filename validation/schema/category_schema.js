const { body } = require("express-validator");

module.exports = [
  body("name")
    .notEmpty()
    .withMessage("name must be filled")
    .isString()
    .withMessage("Name Must be string")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Max length less than 301")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Min length must be greater than 1")
    .bail(),
  body("description")
    .notEmpty()
    .withMessage("description must be filled")
    .isString()
    .withMessage("Description Must be string")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Max length less than 1001")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Min length must be greater than 1")
    .bail(),
];
