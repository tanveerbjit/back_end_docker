const { body } = require("express-validator");

module.exports = [
  body("productId")
    .notEmpty()
    .withMessage("must be a valid id")
    .bail()
    .isMongoId() // Check if it's a valid MongoDB ObjectId
    .withMessage("Invalid id format")
    .bail(),
  body("rating")
    .notEmpty()
    .withMessage("must be filled")
    .isInt({min:1, max:5})
    .withMessage("rating must be between 1 to 5"),
];
