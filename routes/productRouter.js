const authController = require("../controllers/authController");
const productController = require("../controllers/productController");
const customerFeedbackRouter = require("../routes/customerFeedbackRouter");
const router = require("express").Router();
const slugify = require("slugify");

router.use("/:productId/customer-feedbacks", customerFeedbackRouter);

// router
//   .route("/:productId/customer-feedbacks")
//   .get(customerFeedbackController.getAllFeedbacks)
//   .post(
//     authController.protect,
//     authController.restrictTo("buyer"),
//     customerFeedbackController.createFeedback
//   );

// router.get(
//   "/:productId/customer-feedbacks/:id",
//   customerFeedbackController.getFeedback
// );

// Aliases
router.get(
  "/top-sales",
  productController.topSales,
  productController.getAllProducts
);
router.get(
  "/top-cheap",
  productController.topCheap,
  productController.getAllProducts
);
router.get(
  "/deals-of-the-day",
  productController.dealsOfTheDay,
  productController.getAllProducts
);
router.get(
  "/most-searched",
  productController.mostSearched,
  productController.getAllProducts
);

router.get("/", productController.getAllProducts);

router.get("/:slug", productController.getProduct);

// Nested Routes

// Protect with Authentication
router.use(authController.protect);

router.post(
  "/",
  authController.restrictTo("seller"),
  productController.beforeCreateProduct,
  productController.createProduct
);

router.use(authController.restrictTo("seller", "admin"));

router
  .route("/:slug")
  .patch(productController.beforeUpdateProduct, productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
