// const bcrypt = require("bcrypt");
// const success = require("../../helpers/success");
// const asyncHandler = require("express-async-handler");
// const TempAuth = require("../../model/TempAuth");
// const User = require("../../model/User");


// class VerificationService {
 
//   verify = asyncHandler(async (req, res) => {
    

//     /////////////////// find if temporary user exist or not
//     const tempUser = await TempAuth.findByArg({ token: req.params.token });

    
//     if (tempUser.length < 1) {
//       res.status(401);
//       throw new Error("User is not authorized");
//     }

//     /////////////////// find if real user exist or not
//     const userAvailable = await User.findByArg({ email: req.email });
 
//     if (userAvailable.length > 0) {
//       res.status(400);
//       throw new Error("User already registered!");
//     }

//     /// insert into database with user table
//     const user = await User.insertOne({
//       username: tempUser[0].username,
//       email: tempUser[0].email,
//       password: tempUser[0].password,
//       role: tempUser[0].role,
//     });

//     console.log(tempUser[0]);

//     /// Delete temporary data
//     await TempAuth.deleteOne({ _id: tempUser[0]._id });

//     //// confirmation response
//     res.status(201).json(
//       success("Registration successfuly", {
//         msg: "you have been registered successfuly please go to login page to enter your dashboard",
//       })
//     );

//   });

 
// }

// module.exports = new VerificationService();
