const response = require("../util/response");
const validate = require("../validators/validate");
module.exports = async function getPostData(req, res) {
  try {
    let body = "";

    for await (const chunk of req) {
      body += chunk.toString();
    }

    req.body = JSON.parse(body);
    
    validate(req, res);
   

    return JSON.parse(body);
  } catch (error) {
    throw error;
  }
};
