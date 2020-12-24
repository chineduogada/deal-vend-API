const router = require("express").Router();
const productController = require("../controllers/productController");

router
	.route("/")
	.get(productController.getAllProducts)
	.post(productController.createProduct);

module.exports = router;

