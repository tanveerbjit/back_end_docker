const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");
const CartController = require("../controller/CartController");
const CheckoutController = require("../controller/CheckoutController");
const ReviewController = require("../controller/ReviewController");
const RatingController = require("../controller/RatingController");
const cart_schema = require("../validation/schema/cart_schema");
const schema_validation = require("../validation/schema_validation");
const destroy_schema = require("../validation/schema/destroy_schema");
const rating_schema = require("../validation/schema/rating_schema");
const review_schema = require("../validation/schema/review_schema");
const amount_schema = require("../validation/schema/amount_schema");
const file_validation = require("../validation/file_upload_validation");
const errorHandler = require("../middleware/errorHandler");
const user_profile_update_schema = require("../validation/schema/user_profile_update_schema");
const mongo_id_schema = require("../validation/schema/mongo_id_schema");



router.get("/profile", UserController.profile);

router.patch(
  "/profile/update",
  file_validation.single("pic"),
  errorHandler,
  user_profile_update_schema,
  schema_validation,
  UserController.update
);

router.get("/receipts", UserController.receipt);
router.get("/amount", UserController.getAmount);

router.get(
  "/receipts/:id",
  mongo_id_schema,
  schema_validation,
  UserController.receipt_individual
);


router.get(
  "/rating-reiew/:id",
  mongo_id_schema,
  schema_validation,
  RatingController.ratingAndreview
);




/////////////////////////// review
router.post(
  "/review/store",
  review_schema,
  schema_validation,
  ReviewController.store
);
router.put(
  "/review/update",
  review_schema,
  schema_validation,
  ReviewController.update
);
router.delete("/review/destroy/:id", destroy_schema,schema_validation, ReviewController.destroy);


/////////////////////////// rating
router.post(
  "/rating/store",
  rating_schema,
  schema_validation,
  RatingController.store
);
router.put(
  "/rating/update",
  rating_schema,
  schema_validation,
  RatingController.update
);
router.delete(
  "/rating/destroy/:id",
  destroy_schema,
  schema_validation,
  RatingController.destroy
);



router.get("/get-cart", CartController.getCart);

router.get("/voucher", CheckoutController.voucher);
router.post("/checkout", CheckoutController.checkout);

router.post("/cart", cart_schema, schema_validation, CartController.cart);
router.patch(
  "/cart-remove",
  cart_schema,
  schema_validation,
  CartController.cart_remove
);

router.delete(
  "/cart/product/destroy",
  CartController.cart_product_destroy
);
// router.post("/checkout", CartController.checkout);

router.put(
  "/amount/update",
  amount_schema,
  schema_validation,
  UserController.amount
);

module.exports = router;
