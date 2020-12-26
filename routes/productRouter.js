const router = require("express").Router();
const productController = require("../controllers/productController");

router
	.route("/")
	.get((req, res, next) => {
		req.filterOptions = {};

		next();
	}, productController.getAllProducts)
	.post(productController.createProduct);

router
	.route("/:id")
	.get(productController.getProduct)
	.patch(productController.updateProduct)
	.delete(productController.deleteProduct);

module.exports = router;

