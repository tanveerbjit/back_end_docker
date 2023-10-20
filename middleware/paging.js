const { sendResponse } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const initPage = function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 30;
    req.page = page;
    req.pageSize = pageSize;

    // const query = {categories: {"$in": [category.id]}};

    next();
  } catch (error) {
    return sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal server error",
      true
    );
  }
};

module.exports = initPage;
