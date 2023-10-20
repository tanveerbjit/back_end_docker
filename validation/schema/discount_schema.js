const { body } = require("express-validator");
const mongoose = require("mongoose");


module.exports = [


  body("product")
    .notEmpty()
    .withMessage("product must not be empty")
    .bail()
    .isArray()
    .withMessage("product must be an array")
    .bail()
    .custom((value) => {
      if (value.length === 0) {
        throw new Error("At least one product must be specified");
      }
      if (value.length > 1000000) {
        throw new Error("Exceeded the maximum of 1000000 product");
      }
      // Check each element in the 'category' array
      for (const productId of value) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          throw new Error("product must be a valid ObjectId");
        }
      }
      return true;
    })
    .bail(),
  // Validate 'customer' (optional)
  body("premium")
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage("discount must be between 1 to 99")
    .bail(),

  // Validate 'generic' (optional)
  body("generic")
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage("discount must be between 1 to 99")
    .bail(),

  // Validate 'discountStartDateTime' (required)
  body("discountStartDateTime")
    .notEmpty()
    .withMessage("Discount start date and time are required")
    .bail()
    .isISO8601()
    .withMessage("Invalid date format")
    .bail(),

  // Validate 'discountDurationInMinutes' (required)
  body("discountDurationInMinutes")
    .notEmpty()
    .withMessage("Discount duration is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer")
    .bail(),
];





