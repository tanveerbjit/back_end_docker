// const success = require("../../helpers/success");
// const asyncHandler = require("express-async-handler");
// const failed = require("../../helpers/failed");
// const User = require("../../model/User");

// class AdminService {

//   profile = asyncHandler(async (req, res) => {

//     const data = await User.findByArg({ email: req.email });

//     if(data.length>0){
//       return {status:true,data};
//     }
    
//     return {status:false,data:""};
    
//   });

//   allVendors = asyncHandler(async (req, res) => {

//     const data = await User.find();

//      if(data.length>0){
//       return {status:true,data};
//     }
//     return {status:false,data:""};
      
//   });

//   onlyUser = asyncHandler(async (req, res) => {
//     const data = await User.findByArg({ role: "u" });
    
//     if(data.length>0){
//       return {status:true,data};
//     }
//     return {status:false,data:""};

//   });

//   onlyAdmin = asyncHandler(async (req, res) => {
//     const data = await User.findByArg({ role: "a" });
//     data.length > 0
//       ? res.status(200).json(
//           success("users data has found", {
//             msg: data,
//           })
//         )
//       : res.status(404);
//     throw new Error("No data Found");
//   });
// }

// module.exports = new AdminService();
