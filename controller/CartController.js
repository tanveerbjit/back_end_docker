const Product = require("../model/Product");
const success = require("../helpers/success");
const failure = require("../helpers/failed");
const Order = require("../model/Order");
const Cart = require("../model/Cart");
const mongoose = require("mongoose");
const crypto = require("crypto");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");



class CartController {

async getCart(req, res) {
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
                            $ifNull: ["$discount.discountDurationInMinutes", 0],
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
          "orderItems.productDetails.stock": 1,
          "orderItems.productDetails.pic": 1,
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
      return sendResponse(res, HTTP_STATUS.OK, "Your Cart",cartData[0]);
    } else {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "No Cart Found",
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
      const user = req.id;
      const cart = await Cart.findOne({
        user: req.id,
        checkout: false,
      }).populate("orderItems.productId");
      let eArr = [];

      if (cart) {
        for (const element of cart.orderItems) {
          let product = await Product.findOne({ _id: element.productId._id });

          if (product.stock >= element.quantity) {
            product.stock -= element.quantity;

            // updating product stock by deducting them
            await Product.findByIdAndUpdate(product._id, {
              $set: { stock: product.stock },
            });
          } else {
            /// if stock is less then push it into error array
            eArr.push(`${product.name} stock is less`);
          }
        }

        //// check out all product to order collection
        if (eArr.length === 0) {
          // Create a new checkout Order document
          const newOrder = new Order({
            user: cart.user,
            orderItems: cart.orderItems,
            total_bill: cart.total_bill,
          });

          // Save the new order
          await newOrder.save();

          // Update the cart to mark it as checked out
          cart.checkout = true;
          await Cart.findByIdAndUpdate(cart._id, { $set: { checkout: true } });

          return res
            .status(200)
            .json(success("Order placed successfully", newOrder));
        } else {
          // Handle cases where there are errors in eArr
          return res
            .status(400)
            .json(failure("Insufficient stock for some products", eArr));
        }
      } else {
        return res.status(404).json(failure("Data Doesnot Found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal server Error"));
    }
  }

  async cart(req, res) {
    try {
      const user = req.id;
      const { itemId, quantity } = req.body;

      ///checking cart and product
      const cart = await Cart.findOne({ user: req.id, checkout: false });
      const item = await Product.findOne({ _id: itemId });
      const HTTP_STATUS = require("../constants/statusCodes");
      const { sendResponse } = require("../util/common");

      console.log("Item Found", item);

      if (!item) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No Product Found",
          true
        );
      }

      const price = item.price;

      //If cart already exists for user,
      if (cart) {
        /// find if item is already exist or not
        const itemIndex = cart.orderItems.findIndex(
          (items) => items.productId == itemId
        );

        //if exist
        if (itemIndex > -1) {
          /// product exist and get the product
          let product = cart.orderItems[itemIndex];

          /// checking the stock part
          if (item.stock < product.quantity + quantity) {
            return sendResponse(
              res,
              HTTP_STATUS.REQUEST_ENTITY_TOO_LARGE,
              "Stock exceed",
              true
            );
          }

          /// add quantity
          product.quantity += quantity;

          /// add updated item in cart
          cart.orderItems[itemIndex] = product;

          /// save data
          await cart.save();
          return sendResponse(res, HTTP_STATUS.OK, "product added to cart",cart);
          
        } else {
          //// if no data exist in cart the push the new one

          cart.orderItems.push({ productId: itemId, quantity });

          await cart.save();
          return sendResponse(res, HTTP_STATUS.OK, "product added to cart",cart);
        }
      } else {
        if (item.stock < quantity) {
          return sendResponse(
            res,
            HTTP_STATUS.REQUEST_ENTITY_TOO_LARGE,
            "Stock exceed",
            true
          );
        }
        // No cart exists, create one
        const newCart = await Cart.create({
          user,
          orderItems: [{ productId: itemId, quantity }],
        });
        return sendResponse(res, HTTP_STATUS.OK, "product added to cart",newCart);
        
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

  async cart_remove(req, res) {
    try {
      const user = req.id;

      const { itemId, quantity } = req.body;

      /// check the quantity
      if (quantity <= 0) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Quantity should be valid",
          true
        );
      }

      /// check cart and item
      const cart = await Cart.findOne({ user: req.id, checkout: false });
      const item = await Product.findOne({ _id: itemId });

      if (!item) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No Product Found",
          true
        );
      }

      // const price = item.price;

      //If cart already exists for user,
      if (cart) {
        const itemIndex = cart.orderItems.findIndex(
          (items) => items.productId == itemId
        );

        //check if product exists or not

        if (itemIndex > -1) {
          /// product exist and get the product
          let product = cart.orderItems[itemIndex];

          /// check the quantity
          if (product.quantity < quantity) {
            return sendResponse(
              res,
              HTTP_STATUS.REQUEST_ENTITY_TOO_LARGE,
              "Qunatity exceed",
              true
            );
          }

          /// add quantity
          product.quantity -= quantity;

          /// deducted bill

          /// add updated item in orderItems
          if (product.quantity === 0) {
            cart.orderItems.splice(itemIndex, 1);
          } else {
            // Otherwise, update the item in orderItems
            cart.orderItems[itemIndex] = product;
          }

          // Check if cart.orderItems is empty
          if (cart.orderItems.length === 0) {
            // If it's empty, delete the cart
            await Cart.findByIdAndDelete(cart._id);
            return sendResponse(res, HTTP_STATUS.OK, "Cart is empty and has been deleted",true);
          } else {
            // Save data
            await cart.save();
            return sendResponse(res, HTTP_STATUS.OK, "Product removed from cart",cart);
          }
        } else {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "No Item exist",
            true
          );
        }
      } else {
        //no cart exists,
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No cart Exist",
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

 
  async cart_product_destroy(req, res) {
    try {
     
      const { itemId } = req.body;


      /// check cart and item
      const cart = await Cart.findOne({ user: req.id, checkout: false });
      const item = await Product.findOne({ _id: itemId });

      if (!item) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No Product Found",
          true
        );
      }


      //If cart already exists for user,
      if (cart) {

        cart.orderItems.pull({ productId: itemId });

        // Save the updated document
        const updatedOrder = await cart.save();

        if(cart.orderItems.length < 1){
          await Cart.findByIdAndDelete(cart._id);
        }
        

        if(updatedOrder){
          return sendResponse(res, HTTP_STATUS.OK, "product has been deleted from cart",true);
        }
       
        
        //check if product exists or not

       
      } else {
        //no cart exists,
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No cart Exist",
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


module.exports = new CartController();









