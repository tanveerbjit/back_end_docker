const mongoose = require("mongoose");

const LoginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true },
  ip:String,
  limit:Number,
  timestamp: { type: Date, default: Date.now },
});

const LoginAttempt = mongoose.model("LoginAttempt", LoginAttemptSchema);
module.exports = LoginAttempt;
