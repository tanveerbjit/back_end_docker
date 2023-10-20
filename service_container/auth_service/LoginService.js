// const User = require("../../model/User");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const success = require("../../helpers/success");
// const asyncHandler = require("express-async-handler");
// const failed = require("../../helpers/failed");

// class LoginService {


//   login = asyncHandler(async (req, res) => {

//     //////////verification
    
//  const { email, password } = req.body;
//  if (!email || !password) {
//    res.status(400);
//    throw new Error("All fields are mandatory with JSON format!");
//  }

//  const user = await User.findByArg({ email });

//  //compare password with hashedpassword
//  if (user.length > 0 && (await bcrypt.compare(password, user[0].password))) {
//    const accessToken = jwt.sign(
//      {
//        user: {
//          username: user[0].username,
//          email: user[0].email,
//          id: user[0]._id,
//          role: user[0].role,
//        },
//      },
//      process.env.ACCESS_TOKEN_SECERT,
//      { expiresIn: "15m" }
//    );
//    res.cookie("token", accessToken, {
//      httpOnly: true, // Make the cookie accessible only via HTTP(S)
//      maxAge: 900000, // Set the cookie expiration time (15 minutes in milliseconds)
//    });
//    res.status(200).json(success("logged in"));
//  } else {
//    res.status(401);
//    throw new Error("email or password is not valid");
//  }
//   });
// }

// module.exports = new LoginService();
