const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

const validateToken = asyncHandler(async (req, res, next) => {

  try{
    if (req.params.token) {
      jwt.verify(
        req.params.token,
        process.env.ACCESS_TOKEN_SECERT,
        (err, decoded) => {
          if (err) {
            return sendResponse(
              res,
              HTTP_STATUS.UNAUTHORIZED,
              "User is not authorized or token is missin",
              true
            );
          }
          req.email = decoded.user.email;
          req.id = decoded.user.id;
          next();
        }
      );
    } else {
      return sendResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "User is not authorized or token is missin",
        true
      );
    }

  }catch(err){
return sendResponse(
  res,
  HTTP_STATUS.INTERNAL_SERVER_ERROR,
  "Internal server error",
  true
);
  }
  
});

module.exports = validateToken;
