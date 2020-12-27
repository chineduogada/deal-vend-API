const router = require("express").Router();
const productController = require("../controllers/productController");
const cacheQuery = require("../middlewares/cacheQuery");
const cleanCache = require("../middlewares/cleanCache");

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
router.use(cleanCache(null, "products"));

router.post("/", productController.createProduct);

// Setup middleware for routes that will clean `a product` cache
router.use(cleanCache("params.id"));
router
	.route("/:id")
	.patch(productController.updateProduct)
	.delete(productController.deleteProduct);

module.exports = router;

