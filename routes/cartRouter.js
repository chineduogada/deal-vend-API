const authController = require("../controllers/authController");
const cartController = require("../controllers/cartController");
const router = require("express").Router();

// Protect with Authentication
router.use(authController.protect);

router.patch("/", cartController.updateCartItem);
router.get("/", cartController.beforeGetCart, cartController.getCart);
router.delete("/", cartController.beforeDeleteCart, cartController.deleteCart);

module.exports = router;
