const { body } = require("express-validator");

module.exports = [
  body("otp")
    .notEmpty()
    .withMessage("OTP must be filled")
    .bail()
    .isNumeric()
    .withMessage("Must be number")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digit")
    .bail(),
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
    .isStrongPassword({
      minLength: 8,
      maxLength: 30,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must Contain at least 1 lowarcase , 1 uppercase, 1 number, 1 special character and minimum 8 characters and maximum 30 characters long"
    )
    .bail(),
];
