const express = require("express");
const router = express.Router();
const AuthController = require("../controller/AuthController");
const roleAttacher = require("../middleware/roleAttacher");
const reg_schema = require("../validation/schema/reg_schema");
const login_schema = require("../validation/schema/login_schema");
const validateToken = require("../middleware/validateToken");
const shcema_validation = require("../validation/schema_validation");
const forget_schema = require("../validation/schema/forget_schema");
const reset_schema = require("../validation/schema/reset_schema");



/////////////////////////////  registration route for admin
router.post(
  "/admin/registration",
  reg_schema,
  shcema_validation,
  roleAttacher,
  AuthController.registration
);

/////////////////////////////  registration route for user
router.post(
  "/user/registration",
  reg_schema,
  shcema_validation,
  roleAttacher,
  AuthController.registration
);





/////////////////////////////  verify user route
router.get("/verification/:token", validateToken, AuthController.verification);

/////////////////////////////  Login route
router.post("/login", login_schema, shcema_validation, AuthController.login);

/////////////////////////////  Logout route
router.get("/logout", AuthController.logout);

























/////////////////////////////  forget password route
router.post("/forget", forget_schema, shcema_validation, AuthController.sendResetLink);


/////////////////////////////  auth token validity check
router.post("/token-validity-check",AuthController.tokenValidity);


/////////////////////////////  reset password route
router.post("/reset",  AuthController.reset);

// router.post("/reset", reset_schema, shcema_validation, AuthController.reset);













module.exports = router;
