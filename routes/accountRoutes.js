
const express = require("express");
const router = express.Router();
const AccountController = require("../controller/AccountController");
const validate = require("../middleware/validation")




///////////// CRUD OPERATION
router.post("/add", validate, AccountController.store);
router.put("/:id", validate,AccountController.update);
router.get("/all", AccountController.index);
router.get("/:id", AccountController.show);
router.delete("/:id", AccountController.destroy);
router.get("/page/:offset/:limit", AccountController.pagination);
router.get("/:type/:agg/:prop", AccountController.comparison);










module.exports = router;
