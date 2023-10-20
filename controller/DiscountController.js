const Discount = require("../model/Discount"); 
const Product = require("../model/Product");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class DiscountController {

  async discount_add(req, res) {
    try {
      const {
        product,
        premium,
        generic,
        discountStartDateTime,
        discountDurationInMinutes,
      } = req.body;
  
      const existingProducts = await Product.find({ _id: { $in: product } });
  
      if (existingProducts.length !== product.length) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Product does not exist",
          true
        );
      }
  
      // Define an array of product IDs to upsert discounts for
  
      // Create an array of `updateOne` operations for each product
      const upsertOperations = product.map((productId) => {
        const update = {
          discountStartDateTime: new Date(discountStartDateTime),
          discountDurationInMinutes: discountDurationInMinutes,
        };
  
        if (premium !== undefined) {
          update.premium = premium;
        }
  
        if (generic !== undefined) {
          update.generic = generic;
        }
  
        return {
          updateOne: {
            filter: { product: productId }, // Query to find the document by product ID
            update: { $set: update },
            upsert: true, // Perform an upsert operation
          },
        };
      });
  
      // Use bulkWrite to execute the upsert operations
      const discountDocs = await Discount.bulkWrite(upsertOperations);
  
      if (discountDocs) {
        return res
          .status(200)
          .json({ success: true, message: "Discount announced successfully" });
      } else {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Not updated",
          true
        );
       
      }
    } catch (err) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }

  async discount_destroy(req, res) {
    try {
      const { product } = req.body;
  
      const existingProducts = await Product.find({ _id: { $in: product } });
  
      if (existingProducts.length !== product.length) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Product does not exist",
          true
        );
        
      }
  
      // Define an array of product IDs to delete discounts for
      const deleteOperations = product.map((productId) => ({
        deleteOne: {
          filter: { product: productId }, // Query to find the document by product ID
        },
      }));
  
      // Use bulkWrite to execute the delete operations
      const result = await Discount.bulkWrite(deleteOperations);
  
      if (result.deletedCount > 0) {
        return res
          .status(200)
          .json({ success: true, message: "Discounts deleted successfully" });
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No discounts were deleted",
          true
        );
       
      }
    } catch (err) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }
  



}

module.exports = new DiscountController();


