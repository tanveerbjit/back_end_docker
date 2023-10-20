const asyncHandler = require("express-async-handler");
const validateHelper = require("../validators/validate")

const validate = asyncHandler(async (req, res, next) => {
   const product = req.body;

   if (!product.name || typeof product.name !== 'string') {
      return res.status(400).json({success:false, failure:true, error: 'Name should be a string and must exist.' });
  }

  const price = parseFloat(product.price);
  if (isNaN(price) || price < 2 || price > 100000) {
      return res.status(400).json({success:false, failure:true, error: 'Price should be a number between 2 and 100000 and must exist.' });
  }

  if (!product.description || typeof product.description !== 'string') {
      return res.status(400).json({ success:false, failure:true, error: 'Description should be a string and must exist.' });
  }

   next();

});

module.exports = validate;

