const { body } = require("express-validator");
const mongoose = require("mongoose");

// Custom validation function to validate an array of MongoDB ObjectIDs
const isValidMongoArray = (value) => {
  if (!Array.isArray(value)) {
    throw new Error("Value must be an array.");
  }

  if (value.length < 1) {
    throw new Error("Array length must be at least 1.");
  }

  if (value.length > 3) {
    throw new Error("Array length cannot exceed 100,000.");
  }

  // Check if each element is a valid MongoDB ObjectID
  value.forEach((element) => {
    if (!mongoose.Types.ObjectId.isValid(element)) {
      throw new Error(`Invalid MongoDB ObjectID: ${element}`);
    }
  });

  return true; // Validation passed
};



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
  
];





