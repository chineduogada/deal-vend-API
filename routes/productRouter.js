const router = require("express").Router();
const productController = require("../controllers/productController");
const cacheQuery = require("../middlewares/cacheQuery");

router
	.route("/")
	.get(cacheQuery({ key: "products" }), productController.getAllProducts)
	.post(productController.createProduct);

router
	.route("/:id")
	.get(
		cacheQuery(null, (req) => (req.cacheOptions = { key: req.params.id })),
		productController.getProduct
	)
	.patch(productController.updateProduct)
	.delete(productController.deleteProduct);

module.exports = router;

