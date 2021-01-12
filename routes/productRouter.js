const router = require("express").Router();
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const cacheQuery = require("../middlewares/cacheQuery");
const cleanCache = require("../middlewares/cleanCache");

// Aliases
router.get(
  "/top-sales",
  cacheQuery({ key: "products" }),
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

router.get(
  "/",
  cacheQuery({ key: "products" }),
  productController.getAllProducts
);

router.get(
  "/:id",
  cacheQuery(null, (req) => (req.cacheOptions = { key: req.params.id })),
  productController.getProduct
);

// Setup middleware for routes that will clean `products` cache
// Protect with Authentication
router.use(
  authController.protect,
  authController.restrictTo("seller", "admin"),
  cleanCache(null, "products")
);

router.post("/", productController.createProduct);

// Setup middleware for routes that will clean `a product` cache
router.use(cleanCache("params.id"));
router
  .route("/:id")
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
