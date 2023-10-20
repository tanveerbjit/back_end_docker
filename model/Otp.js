const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  ip:{ type: String, required: true },
  otp:{ type: Number, required: true },
  __v:false,
},{ timestamps: true });

const Otp = mongoose.model("Otp", OtpSchema);
module.exports = Otp;