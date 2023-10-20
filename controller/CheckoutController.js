const Product = require("../model/Product");
const User = require("../model/User");
const Auth = require("../model/Auth");
const success = require("../helpers/success");
const failure = require("../helpers/failed");
const Order = require("../model/Order");
const Cart = require("../model/Cart");
const mongoose = require("mongoose");
const crypto = require("crypto");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class CheckoutController {

  async voucher(req, res) {
    try {
      const user = req.id;

      // Checking cart and product
      const cart = await Cart.findOne({ user: req.id, checkout: false });


      if (!cart) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No Cart Found",
          true
        );
      }

      const cartId = cart._id;

      const cartData = await Cart.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(cartId) }, // Match the cart by ID
        },
        {
          $unwind: "$orderItems", // Split the order items array
        },
        {
          $lookup: {
            from: "products", // Replace with the actual name of your product collection
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails", // Split the product details array
        },
        {
          $match: {
            $expr: { $lte: ["$orderItems.quantity", "$productDetails.stock"] }, // Filter items with quantity less than or equal to stock
          },
        },
        {
          $lookup: {
            from: "discounts", // Replace with the actual name of your discount collection
            localField: "productDetails._id",
            foreignField: "product",
            as: "discount",
          },
        },
        {
          $addFields: {
            discount: { $arrayElemAt: ["$discount", 0] },
          },
        },
        {
          $addFields: {
            currentDateTime: new Date(),
          },
        },
        {
          $addFields: {
            isValidDiscount: {
              $and: [
                {
                  $gte: [
                    "$currentDateTime",
                    {
                      $ifNull: ["$discount.discountStartDateTime", new Date(0)],
                    },
                  ],
                },
                {
                  $lte: [
                    "$currentDateTime",
                    {
                      $add: [
                        {
                          $ifNull: [
                            "$discount.discountStartDateTime",
                            new Date(0),
                          ],
                        },
                        {
                          $multiply: [
                            {
                              $ifNull: [
                                "$discount.discountDurationInMinutes",
                                0,
                              ],
                            },
                            60000, // Convert duration to milliseconds
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $addFields: {
            genericDiscount: {
              $cond: [
                "$isValidDiscount",
                {
                  percentage: { $ifNull: ["$discount.generic", 0] },
                  discountedPrice: {
                    $multiply: [
                      "$productDetails.price",
                      { $ifNull: ["$discount.generic", 0] },
                      0.01,
                    ],
                  },
                },
                {
                  percentage: 0,
                  discountedPrice: 0,
                },
              ],
            },
          },
        },
        {
          $addFields: {
            premiumDiscount: {
              $cond: [
                "$isValidDiscount",
                {
                  percentage: { $ifNull: ["$discount.premium", 0] },
                  discountedPrice: {
                    $multiply: [
                      "$productDetails.price",
                      { $ifNull: ["$discount.premium", 0] },
                      0.01,
                    ],
                  },
                },
                {
                  percentage: 0,
                  discountedPrice: 0,
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            user: { $first: "$user" },
            orderItems: {
              $push: {
                productId: "$orderItems.productId",
                quantity: "$orderItems.quantity",
                productDetails: "$productDetails",
                isValidDiscount: "$isValidDiscount",
                genericDiscount: "$genericDiscount",
                premiumDiscount: "$premiumDiscount",
              },
            },
            totalValue: {
              $sum: {
                $multiply: ["$productDetails.price", "$orderItems.quantity"],
              },
            },
            totalDiscountPriceGeneric: {
              $sum: {
                $multiply: [
                  "$genericDiscount.discountedPrice",
                  "$orderItems.quantity",
                ],
              },
            },

            totalDiscountPricePremium: {
              $sum: {
                $multiply: [
                  "$premiumDiscount.discountedPrice",
                  "$orderItems.quantity",
                ],
              },
            },

            checkout: { $first: "$checkout" },
          },
        },
        {
          $project: {
            user: 1,
            "orderItems.quantity": 1,
            "orderItems.productDetails._id": 1,
            "orderItems.productDetails.name": 1,
            "orderItems.productDetails.price": 1,
            "orderItems.productDetails.edition": 1,
            "orderItems.isValidDiscount": 1,
            "orderItems.genericDiscount": 1,
            "orderItems.premiumDiscount": 1,
            totalValue: 1,
            totalDiscountPrice: 1,
            totalDiscountPricePremium: 1,
            totalDiscountPriceGeneric: 1,
            totalValueAfterGenericDiscount: {
              $subtract: ["$totalValue", "$totalDiscountPriceGeneric"],
            },
            totalValueAfterPremiumDiscount: {
              $subtract: ["$totalValue", "$totalDiscountPricePremium"],
            },
            checkout: 1,
          },
        },
      ]);

      if (cartData && cartData.length > 0) {
        return sendResponse(res, HTTP_STATUS.OK, "Your Voucher",cartData[0]);
      } else {
        // If no matching items found, return the cart with missing items and set the voucher field to false
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "voucher not found May be product in cart deleted or stockout",
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

  async checkout(req, res) {
    try {
      // const user = req.id;

      // Checking cart and product
      const cart = await Cart.findOne({ user: req.id, checkout: false });

      if (!cart) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No Cart Found",
          true
        );
     
      }

      const auth = await Auth.findOne({_id:req.id,ban:false});


      if (!auth) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Not available",
          true
        );
      }

      
      const cartId = cart._id;

      const cartData = await Cart.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(cartId) }, // Match the cart by ID
        },
        {
          $unwind: "$orderItems", // Split the order items array
        },
        {
          $lookup: {
            from: "products", // Replace with the actual name of your product collection
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails", // Split the product details array
        },
        {
          $match: {
            $expr: { $lte: ["$orderItems.quantity", "$productDetails.stock"] }, // Filter items with quantity less than or equal to stock
          },
        },
        {
          $lookup: {
            from: "discounts", // Replace with the actual name of your discount collection
            localField: "productDetails._id",
            foreignField: "product",
            as: "discount",
          },
        },
        {
          $addFields: {
            discount: { $arrayElemAt: ["$discount", 0] },
          },
        },
        {
          $addFields: {
            currentDateTime: new Date(),
          },
        },
        {
          $addFields: {
            isValidDiscount: {
              $and: [
                {
                  $gte: [
                    "$currentDateTime",
                    {
                      $ifNull: ["$discount.discountStartDateTime", new Date(0)],
                    },
                  ],
                },
                {
                  $lte: [
                    "$currentDateTime",
                    {
                      $add: [
                        {
                          $ifNull: [
                            "$discount.discountStartDateTime",
                            new Date(0),
                          ],
                        },
                        {
                          $multiply: [
                            {
                              $ifNull: [
                                "$discount.discountDurationInMinutes",
                                0,
                              ],
                            },
                            60000, // Convert duration to milliseconds
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $addFields: {
            genericDiscount: {
              $cond: [
                "$isValidDiscount",
                {
                  percentage: { $ifNull: ["$discount.generic", 0] },
                  discountedPrice: {
                    $multiply: [
                      "$productDetails.price",
                      { $ifNull: ["$discount.generic", 0] },
                      0.01,
                    ],
                  },
                },
                {
                  percentage: 0,
                  discountedPrice: 0,
                },
              ],
            },
          },
        },
        {
          $addFields: {
            premiumDiscount: {
              $cond: [
                "$isValidDiscount",
                {
                  percentage: { $ifNull: ["$discount.premium", 0] },
                  discountedPrice: {
                    $multiply: [
                      "$productDetails.price",
                      { $ifNull: ["$discount.premium", 0] },
                      0.01,
                    ],
                  },
                },
                {
                  percentage: 0,
                  discountedPrice: 0,
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            user: { $first: "$user" },
            orderItems: {
              $push: {
                productId: "$orderItems.productId",
                quantity: "$orderItems.quantity",
                productDetails: "$productDetails",
                isValidDiscount: "$isValidDiscount",
                genericDiscount: "$genericDiscount",
                premiumDiscount: "$premiumDiscount",
              },
            },
            totalValue: {
              $sum: {
                $multiply: ["$productDetails.price", "$orderItems.quantity"],
              },
            },
            totalDiscountPriceGeneric: {
              $sum: {
                $multiply: [
                  "$genericDiscount.discountedPrice",
                  "$orderItems.quantity",
                ],
              },
            },

            totalDiscountPricePremium: {
              $sum: {
                $multiply: [
                  "$premiumDiscount.discountedPrice",
                  "$orderItems.quantity",
                ],
              },
            },

            checkout: { $first: "$checkout" },
          },
        },
        {
          $project: {
            user: 1,
            "orderItems.quantity": 1,
            "orderItems.productDetails._id": 1,
            "orderItems.productDetails.name": 1,
            "orderItems.productDetails.price": 1,
            "orderItems.genericDiscount": 1,
            "orderItems.premiumDiscount": 1,
            totalValue: 1,
            totalDiscountPrice: 1,
            totalDiscountPricePremium: 1,
            totalDiscountPriceGeneric: 1,
            totalValueAfterGenericDiscount: {
              $subtract: ["$totalValue", "$totalDiscountPriceGeneric"],
            },
            totalValueAfterPremiumDiscount: {
              $subtract: ["$totalValue", "$totalDiscountPricePremium"],
            },
          },
        },
      ]);

      // const arr = cartData[0].orderItems.map((element)=>{
      //   element
      // })

       console.log(cart.orderItems.length);


   
      if (cart.orderItems.length !== cartData[0].orderItems.length) {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "some product may be stock out or invalid please check the voucher",
          true
        );
        
      }

      const user = await User.findById(req.user_id)

      console.log(cartData[0]);

      if (cartData && cartData.length > 0) {
        let discount_type = "none"; // Default to "n" (no discount)

        const genericDiscount = cartData[0].totalValueAfterGenericDiscount;
        const premiumDiscount = cartData[0].totalValueAfterPremiumDiscount;
        const userType = auth.user_type;

        if (
          cartData[0].totalValue === genericDiscount &&
          cartData[0].totalValue === premiumDiscount
        ) {
          // No discount ("n")
        } else if (premiumDiscount === genericDiscount && userType === "p") {
          discount_type = "premium"; // Premium discount ("p")
        } else if (premiumDiscount === genericDiscount && userType !== "p") {
          discount_type = "generic"; // Generic discount ("g")
        } else if (premiumDiscount < genericDiscount && userType === "p") {
          discount_type = "premium"; // Premium discount ("p")
        } else if (genericDiscount < premiumDiscount) {
          discount_type = "generic"; // Generic discount ("g")
        }

        // Calculate the discounted amount based on discount_type
        let discountedAmount = 0;
        switch (discount_type) {
          case "premium":
            discountedAmount = premiumDiscount;
            break;
          case "generic":
            discountedAmount = genericDiscount;
            break;
          default:
            discountedAmount = cartData[0].totalValue;
        }

        if (user.amount < discountedAmount) {
          return sendResponse(
            res,
            HTTP_STATUS.PAYMENT_REQUIRED,
            "incifucient balance",
            true
          );
        }

        const bulk = [];
        cartData[0].orderItems.map((element) => {
          bulk.push({
            updateOne: {
              filter: { _id: element.productDetails._id },
              update: { $inc: { stock: -element.quantity } },
            },
          });
        });

        const stockSave = await Product.bulkWrite(bulk);

        // Update the user's amount
        user.amount -= discountedAmount;

        await user.save();

        cartData[0].discount_type = discount_type;
        cartData[0].discount_price = discountedAmount;


        // Create a new Order document
        const newOrder = new Order({
          user: req.user_id, // Assuming you have the user ID available
          orderItems: cartData[0].orderItems,
          totalValue: cartData[0].totalValue,
          totalDiscountPriceGeneric: cartData[0].totalDiscountPriceGeneric,
          totalDiscountPricePremium: cartData[0].totalDiscountPricePremium,
          checkout: true, // Assuming the order is checked out
          totalValueAfterGenericDiscount:
            cartData[0].totalValueAfterGenericDiscount,
          totalValueAfterPremiumDiscount:
            cartData[0].totalValueAfterPremiumDiscount,
          discount_type: discount_type,
          discount_price: discountedAmount,
          // Add any other fields from cartData that you want to include in the Order document
        });

        // Save the new Order document to the database
        const savedOrder = await newOrder.save();
        cart.checkout = true;
        await cart.save();
        return sendResponse(res, HTTP_STATUS.OK, "checkout done successfully",cartData[0]);
        
      } else {
        // If no matching items found, return the cart with missing items and set the voucher field to false
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Your Cart is totally empty",
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

module.exports = new CheckoutController();





