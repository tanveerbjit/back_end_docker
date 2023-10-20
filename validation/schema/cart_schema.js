const { body } = require("express-validator");

module.exports = [
    body('itemId')
    .isMongoId()
    .withMessage('Invalid itemId. Must be a valid MongoDB ObjectId.')
    .bail(),
    body('quantity')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Quantity must be a numeric value between 1 and 100,000.'),
];
