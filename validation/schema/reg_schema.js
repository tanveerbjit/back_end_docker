const { body } = require("express-validator");


const validationRules = [
  body("first_name")
    .notEmpty()
    .withMessage("first name must be filled")
    .bail()
    .isString()
    .withMessage("must be string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("first name must be at least 3 characters long")
    .bail()
    .isLength({ max: 20 })
    .withMessage("first name must be at most 20 characters long")
    .bail(),
  body("last_name")
    .notEmpty()
    .withMessage("last name must be filled")
    .bail()
    .isString()
    .withMessage("must be string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("last name must be at least 3 characters long")
    .bail()
    .isLength({ max: 20 })
    .withMessage("last name must be at most 20 characters long")
    .bail(),
  body("user_name")
    .notEmpty()
    .withMessage("user name must be filled")
    .bail()
    .isString()
    .withMessage("must be string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("user name must be at least 3 characters long")
    .bail()
    .isLength({ max: 20 })
    .withMessage("user name must be at most 20 characters long")
    .bail(),
  body("email")
    .isEmail()
    .withMessage("You must input email")
    .bail()
    .isLength({ max: 30 })
    .withMessage("email must be at most 30 characters long")
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
      minSymbols: 1})
    .withMessage("Password must Contain at least 1 lowarcase , 1 uppercase, 1 number, 1 special character and minimum 8 characters and maximum 30 characters long")
    .bail()
];

module.exports = validationRules;