const { body } = require("express-validator");

module.exports = [
  body("amount")
    .notEmpty()
    .withMessage("must be filled")
    .isInt({ min: 1, max: 100000 })
    .withMessage("rating must be between 1 to 100000"),
];
