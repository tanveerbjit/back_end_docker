const express = require('express');
const router = express.Router();
const AdminController = require("../controller/AdminController")
const ProductController = require("../controller/ProductController");
const product_schema = require("../validation/schema/product_schema");
const product_schema_validation = require("../validation/product_schema_validation");
const isAdmin = require("../middleware/isAdmin");
const file_validation = require("../validation/file_upload_validation");
const category_schema = require("../validation/schema/category_schema");
const category_schema_validation = require("../validation/category_schema_validation");
const category_update_schema = require("../validation/schema/category_update_schema");
const schema_validation = require("../validation/schema_validation");
const CategoryController = require('../controller/CategoryController');
const author_schema = require("../validation/schema/author_schema");
const author_update_schema = require("../validation/schema/author_update_schema");
const destroy_schema = require("../validation/schema/destroy_schema");
const AuthorController = require("../controller/AuthorController");
const PublisherController = require("../controller/PublisherController");
const publisher_schema = require("../validation/schema/publisher_schema");
const publisher_update_schema = require("../validation/schema/publisher_update_schema");
const product_update_schema = require("../validation/schema/product_update_schema");
const DiscountController = require("../controller/DiscountController");
const discount_schema = require("../validation/schema/discount_schema");
const membership_schema = require("../validation/schema/membership_schema");
const ban_schema = require("../validation/schema/ban_schema");
const discount_destroy_schema = require("../validation/schema/discount_destroy_schema");
const user_profile_update_schema = require("../validation/schema/user_profile_update_schema");
const mongo_id_schema = require("../validation/schema/mongo_id_schema");
const errorHandler = require("../middleware/errorHandler")



router.get("/profile", AdminController.profile);

router.patch(
  "/profile/update",
  file_validation.single("pic"),
  errorHandler,
  user_profile_update_schema,
  schema_validation,
  AdminController.update
);


router.get("/vendors", AdminController.all_vendors);
router.get("/only-user", AdminController.users_with_user_role);
router.get("/only-admin", AdminController.users_with_admin_role);



///////////////// all receipts 
router.get("/receipts", AdminController.receipt);
router.get(
  "/receipts/:id",
  mongo_id_schema,
  schema_validation,
  AdminController.receipt_individual
);





///////////////////////// Product CUD operation

router.post(
  "/product/store",
  file_validation.single("pic"),
  errorHandler,
  product_schema,
  schema_validation,
  ProductController.store
);

/////////// update product
router.put(
  "/product/update/:id",
  file_validation.single("pic"),
  errorHandler,
  product_update_schema,
  schema_validation,
  ProductController.update
);


router.delete(
  "/product/destroy/:id",
  destroy_schema,
  schema_validation,
  ProductController.destroy
);






///////////////////////// category CUD operation

router.post(
  "/category/store",
  category_schema,
  schema_validation,
  CategoryController.store
);
router.put(
  "/category/update/:id",
  category_update_schema,
  schema_validation,
  CategoryController.update
);
router.delete(
  "/category/destroy/:id",
  destroy_schema,
  schema_validation,
  ProductController.destroy
);




///////////////////////// author CUD operation

router.post(
  "/author/store",
  author_schema,
  schema_validation,
  AuthorController.store
);
router.put(
  "/author/update/:id",
  author_update_schema,
  schema_validation,
  AuthorController.update
);
router.delete(
  "/author/destroy/:id",
  destroy_schema,
  schema_validation,
  AuthorController.destroy
);


///////////////////////// publisher CUD operation

router.post(
  "/publisher/store",
  isAdmin,
  publisher_schema,
  schema_validation,
  PublisherController.store
);
router.put(
  "/publisher/update/:id",
  isAdmin,
  publisher_update_schema,
  schema_validation,
  PublisherController.update
);
router.delete(
  "/publisher/destroy/:id",
  isAdmin,
  destroy_schema,
  schema_validation,
  PublisherController.destroy
);


///////////////////////// discount CUD operation

router.post(
  "/discount/announce",
  isAdmin,
  discount_schema,
  schema_validation,
  DiscountController.discount_add
);

router.delete(
  "/discount/destroy",
  isAdmin,
  discount_destroy_schema,
  schema_validation,
  DiscountController.discount_destroy
);


///////////////////////// user membership update operation


router.put(
  "/membership/update/",
  membership_schema,
  schema_validation,
  AdminController.membership
);


///////////////////////// user ban update operation


router.put(
  "/ban/update/",
  ban_schema,
  schema_validation,
  AdminController.ban
);





module.exports = router;