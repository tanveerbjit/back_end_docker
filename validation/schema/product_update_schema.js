const { body, param} = require("express-validator");

module.exports = [
  param("id")
    .notEmpty()
    .withMessage("Must provide an id parameter")
    .bail()
    .isMongoId()
    .withMessage("Invalid id format")
    .bail(),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .isLength({ max: 300 })
    .withMessage("Name must be less than 301 characters")
    .bail(),
  body("price")
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage("Price must be an integer and between 1 to 100,000")
    .bail(),
  body("stock")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("Stock must be an integer and between 1 to 10,000")
    .bail(),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1001 characters")
    .bail(),
  body("edition")
    .optional()
    .isFloat({ min: 1, max: 10000 })
    .withMessage("Edition must be between 1 to 10,000")
    .bail(),
  body("number_of_pages")
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage("Number of pages must be an integer and between 1 to 100,000")
    .bail(),
  body("category")
    .optional()
    .isArray()
    .withMessage("Category must be an array")
    .bail()
    .isLength({ min: 1 })
    .withMessage("At least one category must be specified")
    .bail(),
  body("category.*")
    .isMongoId()
    .withMessage("Category must be a valid ObjectId")
    .bail(),
  body("author")
    .optional()
    .isArray()
    .withMessage("Author must be an array")
    .bail()
    .isLength({ min: 1 })
    .withMessage("At least one author must be specified")
    .bail(),
  body("author.*")
    .isMongoId()
    .withMessage("Author must be a valid ObjectId")
    .bail(),
  body("publisher")
    .optional()
    .isArray()
    .withMessage("publisher must be an array")
    .bail()
    .isLength({ min: 1 })
    .withMessage("At least one publication must be specified")
    .bail(),
  body("publisher.*")
    .isMongoId()
    .withMessage("publisher must be a valid ObjectId")
    .bail(),
];
