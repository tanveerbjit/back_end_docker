const { body } = require("express-validator");

module.exports = [
  body("email")
    .isEmail()
    .withMessage("Input a valid email")
    .bail()
    .isLength({ max: 30 })
    .withMessage("Email must be atmost 30 character long")
    .bail(),
  body("password")
    .notEmpty()
    .withMessage("Password must be filled")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .bail()
    .isLength({ max: 30 })
    .withMessage("Password must be at most 30 characters long"),
];
