const router = require("express").Router();
const productController = require("../controllers/productController");
const cacheQuery = require("../middlewares/cacheQuery");

router
	.route("/")
	.get(cacheQuery, productController.getAllProducts)
	.post(productController.createProduct);

router
	.route("/:id")
	.get(cacheQuery, productController.getProduct)
	.patch(productController.updateProduct)
	.delete(productController.deleteProduct);

module.exports = router;

