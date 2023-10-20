const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
      max: 30,
    },
    role: {
      type: String,
      lowercase: true,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    ban: {
      type: Boolean,
      default: false,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resetPassword: {type:Boolean,default:false},
    resetPasswordToken: {type: String, default:null},
    resetPasswordExpire: {type: String, default:null},
    password: { type: String, required: true, max: 30 },
  },
  { timestamps: true }
);

const Auth = mongoose.model("Auth", AuthSchema);
module.exports = Auth;
