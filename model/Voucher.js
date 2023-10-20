const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    cart:{ type: mongoose.Schema.Types.ObjectId, ref: "Cart"},
    orderItems: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId},
          name:String,
          preice:Number,
          quantity: Number,
          _id:false,
        },
      ],
      total_bill: { type: Number },
  },
  { timestamps: true }
);

const Voucher = mongoose.model("Cart", VoucherSchema);
module.exports = Voucher;