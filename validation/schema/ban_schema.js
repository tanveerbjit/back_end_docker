const { body } = require("express-validator");

module.exports = [
  body("userId")
    .notEmpty()
    .withMessage("must be a valid id")
    .bail()
    .isMongoId() // Check if it's a valid MongoDB ObjectId
    .withMessage("Invalid id format"),
  body("ban")
    .notEmpty()
    .withMessage("must be a valid boolean")
    .bail()
    .isBoolean()
    .withMessage("must be boolean"),
];
