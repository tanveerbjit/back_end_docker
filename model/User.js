const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    address: String,
    pic: String,
    user_name: String,
    phone: String,

    email: {
      type: String,
      lowercase: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
      max: 30,
    },
    role: {
      type: String,
      lowercase: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
