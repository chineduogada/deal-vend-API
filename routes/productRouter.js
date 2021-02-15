const authController = require("../controllers/authController");
const productController = require("../controllers/productController");
const router = require("express").Router();
const slugify = require("slugify");

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

// Protect with Authentication
router.use(authController.protect);

router.post(
  "/",
  authController.restrictTo("seller"),
  productController.createProduct
);

router.use(authController.restrictTo("seller", "admin"));

router
  .route("/:slug")
  .patch((req, _res, next) => {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }

    next();
  }, productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
