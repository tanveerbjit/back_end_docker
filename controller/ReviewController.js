const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");
const Review = require("../model/Review");
const Auth = require("../model/Auth");
const Product = require("../model/Product");
const mongoose = require("mongoose");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class ReviewController {
  async index(req, res) {
    try {
      const { id } = req.params;

  
      const aggregatePipeline = [];
  
      // Add a $match stage to filter by product ID
      aggregatePipeline.push({
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      });
  
      // Add a $lookup stage to join the 'reviews' collection
      aggregatePipeline.push({
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      });
  
      // Unwind the reviews array
      aggregatePipeline.push({
        $unwind: {
          path: "$reviews",
          preserveNullAndEmptyArrays: true,
        },
      });
  
      // Add a $lookup stage to join the 'auths' collection for user information
      aggregatePipeline.push({
        $lookup: {
          from: "auths",
          localField: "reviews.user",
          foreignField: "_id",
          as: "reviews.user_info",
        },
      });
  
      // Project the fields you want to include in the final result
      aggregatePipeline.push({
        $project: {
          reviews: {
            $map: {
              input: {
                $cond: [
                  { $isArray: "$reviews" }, // Check if "reviews" is an array
                  "$reviews",
                  [] // If it's not an array, use an empty array
                ],
              },
              as: "reviewData",
              in: {
                review: {
                  $ifNull: ["$$reviewData.review", null], // Handle missing "review" field
                },
                email: {
                  $ifNull: ["$$reviewData.user_info.email", null], // Retrieve user email
                },
              },
            },
          },
        },
      });
  
      const data = await Product.aggregate(aggregatePipeline);
  
      if (data.length > 0) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data[0]);
      } else {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Data Does not found", true);
      }
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        true
      );
    }
  }
  


  async store(req, res) {
    try {

      const { productId, review } = req.body;
      const userId = req.id;

    

      // check for product availability
      const productExist = await Product.findById(productId);
      if (!productExist) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Product Does not found",
          true
        );
      }

      const newReview = {
        product: productId,
        user: userId,
        email:req.email,
        review,
      };

      // Define the upsert option to true
      const options = { upsert: true, new: true };

      const data = await Review.findOneAndUpdate(
        { product: productId, user: userId },
        newReview,
        options
      );


      if (data) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Data Has been saved succesfully",
          data
        );
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      }
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
      
    }
  }

  async update(req, res) {
    try {
      const { productId, review } = req.body;

      const reviewExist = await Review.findOne({product:productId,user:req.id});

      if (!reviewExist) {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review Does not found",
          true
        );
        
      }

      reviewExist.review = review;


      const updatedReview = await reviewExist.save();


      // const updatedReview = await Review.findOneAndUpdate(
      //   { _id: productId },
      //   {$set:{review}},
      //   { new: true }
      // );

      console.log(updatedReview);

      if (updatedReview) {
        return sendResponse(res, HTTP_STATUS.OK, "review updated successfully", updatedReview);
      } else {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review not found",
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

  async destroy(req, res) {
    try {
      const { id } = req.params;

      console.log("product ID: ",id);

      const reviewExist = await Review.findOne({product:id,user:req.id});

      if (!reviewExist) {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review not found",
          true
        );
        
      }
      

      console.log("review ID: ", reviewExist._id)

      const deletedReview = await Review.findOneAndDelete({
        _id: reviewExist._id,
      });
    

      console.log(deletedReview)

      if (deletedReview) {

        return sendResponse(res, HTTP_STATUS.OK, "review deleted successfully", deletedReview);
        
      } else {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review not found",
          true
        );
        
      }
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }
}

module.exports = new ReviewController();
