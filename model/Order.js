const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        quantity: Number,
        productDetails: {
          _id: mongoose.Schema.Types.ObjectId,
          name: String,
          price: Number,
        },
        genericDiscount: {
          percentage: Number,
          discountedPrice: Number,
        },
        premiumDiscount: {
          percentage: Number,
          discountedPrice: Number,
        },
      },
    ],
    totalValue: Number,
    totalDiscountPriceGeneric: Number,
    totalDiscountPricePremium: Number,
    checkout: Boolean,
    totalValueAfterGenericDiscount: Number,
    totalValueAfterPremiumDiscount: Number,
    discount_type: String,
    discount_price: Number,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;