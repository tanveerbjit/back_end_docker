const mongoose = require("mongoose");

const TempSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "can't be blank"],
      min: 3,
      max: 20,
    },
    last_name: {
      type: String,
      required: [true, "can't be blank"],
      min: 3,
      max: 20,
    },
    user_name: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      min: 3,
      max: 50,
      index: true,
    },
    role: {
      type: String,
      lowercase: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const TempUser = mongoose.model("TempUser", TempSchema);
module.exports = TempUser;
