const { body } = require("express-validator");
const mongoose = require("mongoose");

module.exports = [
  body("name")
    .notEmpty()
    .withMessage("Name must not be empty")
    .bail()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Name must be less than 301 characters")
    .bail(),
  
  body("price")
    .notEmpty()
    .withMessage("Price must not be empty")
    .bail()
    .isInt({ min: 1, max: 100000 })
    .withMessage("Price must be an integer and between 1 to 100,000")
    .bail(),

  body("stock")
    .notEmpty()
    .withMessage("Stock must not be empty")
    .bail()
    .isInt({ min: 1, max: 10000 })
    .withMessage("Stock must be an integer and between 1 to 10,000")
    .bail(),

  // body("image")
  //   .notEmpty()
  //   .withMessage("Image must not be empty")
  //   .bail()
  //   .isString()
  //   .withMessage("Image must be a string")
  //   .bail()
  //   .isLength({ max: 500 })
  //   .withMessage("Name must be less than 501 characters")
  //   .bail(),

  body("description")
    .notEmpty()
    .withMessage("Description must not be empty")
    .bail()
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1001 characters")
    .bail(),

  body("edition")
    .notEmpty()
    .withMessage("Edition must not be empty")
    .bail()
    .isFloat({ min: 1, max: 10000 })
    .withMessage("Edition must be between 1 to 10,000")
    .bail(),

  body("number_of_pages")
    .notEmpty()
    .withMessage("Number of pages must not be empty")
    .bail()
    .isInt({ min: 1, max: 100000 })
    .withMessage("Number of pages must be an integer and between 1 to 100,000")
    .bail(),

  body("category")
    .notEmpty()
    .withMessage("Category must not be empty")
    .bail()
    .isArray()
    .withMessage("Category must be an array")
    .bail()
    .custom((value) => {
      if (value.length === 0) {
        throw new Error("At least one category must be specified");
      }
      if (value.length > 20) {
        throw new Error("Exceeded the maximum of 20 categories");
      }
      // Check each element in the 'category' array
      for (const categoryId of value) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          throw new Error("Category must be a valid ObjectId");
        }
      }
      return true;
    })
    .bail(),

  body("author")
    .notEmpty()
    .withMessage("Author must not be empty")
    .bail()
    .isArray()
    .withMessage("Author must be an array")
    .bail()
    .custom((value) => {
      if (value.length === 0) {
        throw new Error("At least one author must be specified");
      }
      if (value.length > 20) {
        throw new Error("Exceeded the maximum of 20 authors");
      }
      // Check each element in the 'author' array
      for (const authorId of value) {
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
          throw new Error("Author must be a valid ObjectId");
        }
      }
      return true;
    })
    .bail(),

  body("publisher")
    .notEmpty()
    .withMessage("Publisher must not be empty")
    .bail()
    .isArray()
    .withMessage("Publisher must be an array")
    .bail()
    .custom((value) => {
      if (value.length === 0) {
        throw new Error("At least one publisher must be specified");
      }
      if (value.length > 20) {
        throw new Error("Exceeded the maximum of 20 publishers");
      }
      // Check each element in the 'publisher' array
      for (const publisherId of value) {
        if (!mongoose.Types.ObjectId.isValid(publisherId)) {
          throw new Error("Publisher must be a valid ObjectId");
        }
      }
      return true;
    })
    .bail(),
];
