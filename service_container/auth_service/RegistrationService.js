// const User = require("../../model/User");
// const success = require("../../helpers/success");
// const asyncHandler = require("express-async-handler");
// const failed = require("../../helpers/failed");
// const VerificationCheck_CodeSenderService = require("./VerificationCheck_CodeSenderService");


// class RegistrationService {


//     constructor(){
//         this.VerificationCheck_CodeSenderService =
//           VerificationCheck_CodeSenderService;
//     }

//   registration = asyncHandler(async (req, res) => {



//     /////////// validation middleware ////////////////
//     const { username, email, password } = req.body;
//     if (!username || !email || !password) {
//       console.log(req.role);
//       res.status(400);
//       throw new Error("All fields are mandatory!");
//     }


//     /////////////////// find if user exist or not
//     const userAvailable = await User.findByArg({ email });
//     console.log(userAvailable);
//     if (userAvailable.length > 0) {
//       res.status(400);
//       throw new Error("User already registered!");
//     }



//     ///// send email with verification code
//     await this.VerificationCheck_CodeSenderService.check_send(req,res);

   

   
//     res.json(failed("Register the user"));



//   });


// }

// module.exports = new RegistrationService();
