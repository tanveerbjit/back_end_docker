const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Replace 'Product' with the actual name of your product schema
    required: true,
  },
  premium: {type:Number,default:0}, // You can change the type to whatever represents a customer in your application (e.g., ObjectId for customers)
  generic:{type:Number,default:0},
  discountStartDateTime: {
    type: Date,
    required: true,
  },
  discountDurationInMinutes: {
    type: Number,
    required: true,
  },
});

const Discount = mongoose.model("Discount", discountSchema);

module.exports = Discount;
