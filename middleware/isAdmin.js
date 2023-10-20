const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

const isAdmin = asyncHandler(async (req, res, next) => {

  try {
    const token = req.cookies.token;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECERT, (err, decoded) => {
      if (err) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "User is not authorized or token is missin",
          true
        );
      }

      if (decoded.user_data.role !== "a") {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "User is not authorized or token is missin",
          true
        );
      } else {
        req.email = decoded.user_data.email;
        req.id = decoded.user_data._id;
        req.user_id = decoded.user_data.user;
      }

      next();
    });
  } catch (error) {
    return sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal server error",
      true
    );
  }
    

});

module.exports = isAdmin;
