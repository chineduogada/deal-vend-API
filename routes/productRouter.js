const authController = require("../controllers/authController");
const productController = require("../controllers/productController");
const customerFeedbackRouter = require("../routes/customerFeedbackRouter");
const router = require("express").Router();

// Nested Routes
router.use("/:productId/customer-feedbacks", customerFeedbackRouter);

// Aliases
router.get("/top-sales", ...productController.topSales);
router.get("/top-cheap", ...productController.topCheap);
router.get("/deals-of-the-day", ...productController.dealsOfTheDay);
router.get("/most-searched", ...productController.mostSearched);

router.get("/", productController.getAllProducts);
router.get("/:slug", ...productController.getProduct);

// Protect with Authentication
router.use(authController.protect);

router.post(
  "/",
  authController.restrictTo("seller"),
  ...productController.createProduct
);

router.use(authController.restrictTo("seller", "admin"));

router
  .route("/:slug")
  .patch(...productController.updateProduct)
  .delete(...productController.deleteProduct);

module.exports = router;
