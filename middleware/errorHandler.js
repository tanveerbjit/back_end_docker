const { constants } = require("../helpers/errorConstants");
const errorMessage = require("../helpers/errosMessages");
const multer = require("multer");
const { sendResponse } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

const errorHandler = (err, req, res, next) => {
  console.log('error handling invoked')
  if (err) {
    // Check if the error is an instance of multer.MulterError
    if (err instanceof multer.MulterError) {
      let msg = "";
      if (err.message === "File too large") {
        msg = "File too large, " + "Can not upload more than 1MB";
      }else{
        msg = err.message;
      }
      return sendResponse(
        res,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        msg,
        true
      );
        
    }

    if (err.message === "Only .jpg, .png, or .jpeg format allowed!") {
       return sendResponse(
         res,
         HTTP_STATUS.UNPROCESSABLE_ENTITY,
         err.message,
         true
       );
     }
 

    // Handle other errors
    return sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal server error",
      true
    );
  }
};

module.exports = errorHandler;


