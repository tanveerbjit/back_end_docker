const { body } = require("express-validator");

module.exports = [
  body("productId")
    .notEmpty()
    .withMessage("must be a valid id")
    .bail()
    .isMongoId() // Check if it's a valid MongoDB ObjectId
    .withMessage("Invalid id format")
    .bail(),
  body("review")
    .notEmpty()
    .withMessage("must be filled")
    .isString()
    .withMessage("Name Must be string")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Max length less than 1001")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Min length must be greater than 1"),
];
