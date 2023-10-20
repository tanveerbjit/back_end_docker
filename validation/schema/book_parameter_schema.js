const mongoose = require("mongoose");
const { query } = require("express-validator");

module.exports = [
  query("price_start")
    .optional()
    .isFloat({ min: 0, max: 100000000 })
    .withMessage("price range is in between 0 to 100000000")
    .bail(),
  query("price_end")
    .optional()
    .isFloat({ min: 0, max: 100000000 })
    .withMessage("price range is in between 0 to 100000000")
    .bail(),
  query("stock")
    .optional()
    .isInt({ min: 0, max: 100000000 })
    .withMessage("stock range is in between 0 to 100000000")
    .bail(),
  query("query")
    .optional()
    .isString()
    .withMessage("Query must be string")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Query can not exceed 50 character")
    .bail(),
  query("page_size")
    .optional()
    .isInt({ min: 1, max: 25 })
    .withMessage("page size  is in between 1 to 25")
    .bail(),
  query("page")
    .optional()
    .isInt({ min: 1, max: 1000000000 })
    .withMessage("page is in between 1 to 1000000000")
    .bail(),
  query("stockSort")
    .optional()
    .isIn(["asc", "dsc"]) // Check if the input is either 'u' or 'p'
    .withMessage("sort must be either asc or dsc")
    .bail(),
  query("priceSort")
    .optional()
    .isIn(["asc", "dsc"]) // Check if the input is either 'u' or 'p'
    .withMessage("sort must be either asc or dsc")
    .bail(),
  query("discountSort")
    .optional()
    .isIn(["asc", "dsc"]) // Check if the input is either 'u' or 'p'
    .withMessage("sort must be either asc or dsc")
    .bail(),
  query("ratingSort")
    .optional()
    .isIn(["asc", "dsc"]) // Check if the input is either 'u' or 'p'
    .withMessage("sort must be either asc or dsc")
    .bail(),

  query("category")
    .optional()
    .isArray()
    .withMessage("Category must be an array")
    .bail()
    .custom((value) => {
      if (value.length > 10) {
        throw new Error("Exceeded the maximum of 10 categories");
      }
      // Check each element in the 'category' array
      for (const id of value) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Category must be a valid ObjectId");
        }
      }
      return true;
    })
    .bail(),
  query("author")
    .optional()
    .isArray()
    .withMessage("Author must be an array")
    .bail()
    .custom((value) => {
      if (value.length > 10) {
        throw new Error("Exceeded the maximum of 10 authors");
      }
      // Check each element in the 'category' array
      for (const id of value) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Author must be a valid ObjectId");
        }
      }
      return true;
    })
    .bail(),
  query("publisher")
    .optional()
    .isArray()
    .withMessage("Publisher must be an array")
    .bail()
    .custom((value) => {
      if (value.length > 10) {
        throw new Error("Exceeded the maximum of 10 publishers");
      }
      // Check each element in the 'category' array
      for (const id of value) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Publisher must be a valid ObjectId");
        }
      }
      return true;
    })
    .bail(),
  query("rating")
    .optional()
    .isArray()
    .withMessage("Rating must be an array")
    .bail()
    .custom((value) => {
      if (value.length > 5) {
        throw new Error("Exceeded the maximum of 5 ratings");
      }
      // Check each element in the 'category' array
      for (const num of value) {
        if (num > 5 || num < 0) {
          throw new Error("Rating must be a valid number between 0 - 5");
        }
      }
      return true;
    })
    .bail(),
];
