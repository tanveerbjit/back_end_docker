const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

const schema_validation = function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Validation Error",errors.array());
  }
  next();
};

module.exports = schema_validation;
