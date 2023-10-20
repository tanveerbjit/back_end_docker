const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");
const Review = require("../model/Review");
const Auth = require("../model/Auth")
const Order = require("../model/Order")
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class UserController {
  async profile(req, res) {
    try {
      const data = await User.findOne(
        { email: req.email },
        "-_id -__v -createdAt -updatedAt"
      );
      if (data) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data);
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User Does not found",
          true
        );
      }
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }

  async update(req, res) {
    try {
      const user = await User.findOne({ email: req.email });
      if (user) {
        const { first_name, last_name, phone, address } = req.body;

        if (first_name !== undefined && first_name !== "") {
          user.first_name = first_name;
        }
        if (last_name !== undefined && last_name !== "") {
          user.last_name = last_name;
        }
        if (phone !== undefined && phone !== "") {
          user.phone = phone;
        }
        if (address !== undefined && address !== "") {
          user.address = address;
        }

        if (req.file) {
          let msg = "";
          let errFlag = false;

          if (req.file.fieldname !== "pic") {
            msg = "Incorrect Image Field";
            errFlag = true;
          }
          if (
            req.file.mimetype !== "image/png" &&
            req.file.mimetype !== "image/jpg" &&
            req.file.mimetype !== "image/jpeg"
          ) {
            console.log(req.file.mimetype);
            msg = "Incorrect file type";
            errFlag = true;
          }
          // console.log(req.file.size);
          if (req.file.size > 2000000) {
            msg = "Size greater than 2MB";
            errFlag = true;
          }
          if (errFlag) {
            return sendResponse(
              res,
              HTTP_STATUS.UNPROCESSABLE_ENTITY,
              msg,
              true
            );
          } else {
            user.pic = req.file.path.replace(/\\/g, "/");
          }
        }

        const updatedData = await user.save();
        if (updatedData) {
          return sendResponse(
            res,
            HTTP_STATUS.OK,
            "Updated Data Has Found",
            updatedData
          );
        } else {
          return sendResponse(
            res,
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            "unable to update",
            true
          );
        }
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User Does not found",
          true
        );
      }
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }

  async add_review(req, res) {
    try {
      const { productId, review } = req.body;

      const auth = await Auth.findById(req.id);

      // check for product availability
      const productExist = await Product.findById(productId);
      if (!productExist) {
        return res.status(404).json(failure("Product Does not found"));
      }

      const reviewExist = await Review.findOne({
        product: productId,
        user: req.id,
      });

      if (reviewExist) {
        return res.status(404).json(failure("review already exist"));
      }

      // Assume you have the productId and userId available
      const newReview = new Review({
        product: productId,
        user: req.id,
        review,
      });

      // Save the new review document to the database
      const data = await newReview.save();

      if (data) {
        return res
          .status(200)
          .json(success("Data Has been saved succesfully", data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  // async amount(req, res) {
  //   try {
  //     const { amount } = req.body;

  //     const userExist = await User.findOne({ _id: req.user_id });

  //     if (!userExist) {
  //       return sendResponse(
  //         res,
  //         HTTP_STATUS.NOT_FOUND,
  //         "User Does not found",
  //         true
  //       );
  //     }

  //     const accAmount = userExist.amount + parseFloat(amount);
  //     if (accAmount > 100000) {
  //       return sendResponse(
  //         res,
  //         HTTP_STATUS.UNPROCESSABLE_ENTITY,
  //         `your existing amount is ${userExist.amount} your max limit of credit is 100000 try to input less amount`,
  //         true
  //       );
  //     }

  //     userExist.amount = userExist.amount + amount;
  //     const result = userExist.save();

  //     if (result) {
  //       return sendResponse(res, HTTP_STATUS.OK, `credited by ${amount}`);
  //     } else {
  //       return sendResponse(
  //         res,
  //         HTTP_STATUS.NOT_FOUND,
  //         "unsuccess transaction try try again",
  //         true
  //       );
  //     }

  //     // check for product availability
  //   } catch (error) {
  //     return sendResponse(
  //       res,
  //       HTTP_STATUS.INTERNAL_SERVER_ERROR,
  //       "Internal server error",
  //       true
  //     );
  //   }
  // }

  async  amount(req, res) {
  try {
    const { amount } = req.body;

    // Convert the amount from a string to a number using parseFloat
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount)) {
      return sendResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid amount format",
        true
      );
    }

    const userExist = await User.findOne({ _id: req.user_id });

    if (!userExist) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "User does not found",
        true
      );
    }

    const accAmount = userExist.amount + parsedAmount;

    if (accAmount > 100000) {
      return sendResponse(
        res,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        `Your existing amount is ${userExist.amount}. Your max limit of credit is 100000. Try to input less amount.`,
        true
      );
    }

    userExist.amount = accAmount;

    const result = await userExist.save();

    if (result) {
      return sendResponse(res, HTTP_STATUS.OK, `Credited by ${parsedAmount}`);
    } else {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Unsuccessful transaction. Try again.",
        true
      );
    }

    // check for product availability
  } catch (error) {
    return sendResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal server error",
      true
    );
  }
}


  async getAmount(req, res) {
    try {

      const userExist = await User.findOne({ _id: req.user_id });

      if (!userExist) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User Does not found",
          true
        );
      }

    
    return sendResponse(res, HTTP_STATUS.OK,"data found",userExist);
     
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }

  // async order(req, res) {
  //   try {
  //     const data = await Order.find(
  //       { email: req.email },
  //       "-_id -__v -createdAt -updatedAt"
  //     );
  //     if (data) {
  //       return res.status(200).json(success("Data Has Found", data));
  //     } else {
  //       return res.status(404).json(failure("Data Does not found"));
  //     }
  //   } catch (error) {
  //     return res.status(500).json(failure("Internal Server Error"));
  //   }
  // }

  async receipt(req, res) {
    try {
      const data = await Order.find({ user: req.user_id }).populate("user");
      if (data.length < 1) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      } else {
        return sendResponse(res, HTTP_STATUS.OK, "data found", data);
      }
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }



  async receipt_individual(req, res) {
    try {
      const { id } = req.params;
      const data = await Order.find({ user: req.user_id, _id: id }).populate(
        "user"
      );
      if (data.length < 1) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      } else {
        return sendResponse(res, HTTP_STATUS.OK, "data found", data);
      }
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }
}

module.exports = new UserController();
