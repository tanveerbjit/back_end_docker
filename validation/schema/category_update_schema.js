const { body, param } = require("express-validator");

module.exports = [
  param("id")
    .notEmpty()
    .withMessage("must need id parameter")
    .bail()
    .isMongoId() // Check if it's a valid MongoDB ObjectId
    .withMessage("Invalid id format")
    .bail(),
  body("name")
    .optional()
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
    .optional()
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
