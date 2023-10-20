const User = require("../model/User");
const Auth = require("../model/Auth");
const Order = require("../model/Order");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class AdminController {
  
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

  async all_vendors(req, res) {
    try {
      const data = await User.find({}, "-_id -__v -createdAt -updatedAt");
      if (data.length > 0) {
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

  async users_with_user_role(req, res) {
    try {
      const data = await User.aggregate([
        {
          $match: { role: "u" }, // Filter by role 'u'
        },
        {
          $lookup: {
            from: "auths", // Name of the Auth model's collection
            localField: "_id", // Use the _id field from the User model
            foreignField: "user", // Join using the user field in the Auth model
            as: "auth_data",
          },
        },
        {
          $project: {
            _id: 1,
            "auth_data._id": 1, // Access the _id field from the Auth model
            ban: { $arrayElemAt: ["$auth_data.ban", 0] }, // Get the 'ban' field from the Auth model
            premium: { $arrayElemAt: ["$auth_data.premium", 0] },
            first_name: 1,
            last_name: 1,
            user_name: 1,
            role: 1,
            amount: 1,
            email: 1,
          },
        },
      ]);
      if (data.length > 0) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data);
        
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
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

  async users_with_admin_role(req, res) {
    try {
      const data = await User.where("role")
        .eq("a")
        .select("-_id -__v -createdAt -updatedAt");
      if (data.length > 0) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data);
       
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
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

  async membership(req, res) {
    try {
      const { userId, premium } = req.body;

      const data = await Auth.findOne({ _id: userId, role: "u" });
      if (!data) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
        
      } else {
        data.premium = premium;
        const result = await data.save();
        if (result) {
          return sendResponse(res, HTTP_STATUS.OK, "user membership updated successfully");
        } else {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Data Does not found",
            true
          );
          
        }
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

  async ban(req, res) {
    try {
      const { userId,ban } = req.body;

      const data = await Auth.findOne({ _id: userId, role: "u" });
      if (!data) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      } else {
        data.ban = ban;
        const result = await data.save();
        if (result) {
          return sendResponse(res, HTTP_STATUS.OK, "user ban updated successfully");
        } else {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Data Does not found",
            true
          );
        }
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



  async receipt(req, res) {
    try {
      
      const data = await Order.find({ role: "u" }).populate("user");
      if (data.length < 1) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      } else {
        return sendResponse(res, HTTP_STATUS.OK, "user ban updated successfully", data);
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
      const data = await Order.find({_id:id}).populate(
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




module.exports = new AdminController()