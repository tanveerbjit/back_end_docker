// const User = require("../../model/User");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const success = require("../../helpers/success");
// const asyncHandler = require("express-async-handler");
// const failed = require("../../helpers/failed");

// class GoogleService {


//   login = asyncHandler(async (req, res) => {

    
//     /////////////////// find if user exist or not
//     const userAvailable = await User.findByArg({ email: req.user.email });
//     if (userAvailable.length > 0) {
//       const accessToken = jwt.sign(
//         {
//           user: {
//             username: userAvailable[0].username,
//             email: userAvailable[0].email,
//             id: userAvailable[0]._id,
//             role: userAvailable[0].role,
//           },
//         },
//         process.env.ACCESS_TOKEN_SECERT,
//         { expiresIn: "15m" }
//       );
//       res.cookie("token", accessToken, {
//         httpOnly: true, // Make the cookie accessible only via HTTP(S)
//         maxAge: 900000, // Set the cookie expiration time (15 minutes in milliseconds)
//       });
//       res.status(200).json(success("logged in"));


      
//     }else{

//       const user = await User.insertOne({
//         username: req.user.name,
//         email: req.user.email,
//         password: req.user.id,
//         role: "u",
//       });

//       const accessToken = jwt.sign(
//         {
//           user: {
//             username: req.user.name,
//             email: req.user.email,
//             id: "",
//             role: "u",
//           },
//         },
//         process.env.ACCESS_TOKEN_SECERT,
//         { expiresIn: "15m" }
//       );
//       res.cookie("token", accessToken, {
//         httpOnly: true, // Make the cookie accessible only via HTTP(S)
//         maxAge: 900000, // Set the cookie expiration time (15 minutes in milliseconds)
//       });

//       res.status(200).json(success("logged in"));

//     }

 
//   });
// }

// module.exports = new GoogleService();
