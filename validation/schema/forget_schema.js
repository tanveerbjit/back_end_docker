const { body } = require("express-validator");

module.exports = [
  body("email")
    .isEmail()
    .withMessage("Input a valid email")
    .bail()
    .isLength({ max: 30 })
    .withMessage("Email must be atmost 30 character long"),
];
