const asyncHandler = require("express-async-handler");
const validateHelper = require("../validators/validate")

const validate = asyncHandler(async (req, res, next) => {
   
    const product = req.body
   const errors = [];

// Validate name field
if (product.hasOwnProperty('name')) {
    if (typeof product.name !== 'string' || product.name.length > 100) {
        errors.push('Name should be a string and not exceed 100 characters.');
    }
} else {
    errors.push('Name field is required.');
}

// Validate price field
if (product.hasOwnProperty('price')) {
    const price = parseFloat(product.price);
    if (isNaN(price) || price < 2 || price > 100000) {
        errors.push('Price should be a number between 2 and 100000.');
    }
} else {
    errors.push('Price field is required.');
}

// Validate description field
if (product.hasOwnProperty('description')) {
    if (typeof product.description !== 'string' || product.description.length > 2000) {
        errors.push('Description should be a string and not exceed 2000 characters.');
    }
} else {
    errors.push('Description field is required.');
}

// Check for extra fields
const allowedFields = ['name', 'price', 'description'];
for (const field in product) {
    if (!allowedFields.includes(field)) {
        errors.push(`Field '${field}' is not allowed.`);
    }
}

if(errors.length > 0){
    return res.status(400).json({success:false, failure:true, errors})
}

   next();

});

module.exports = validate;