const { param } = require("express-validator");

module.exports = [
  param("id")
    .notEmpty()
    .withMessage("must need id parameter")
    .bail()
    .isMongoId() // Check if it's a valid MongoDB ObjectId
    .withMessage("Invalid id format")
    .bail(),
];
