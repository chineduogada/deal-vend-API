const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/auth/signup", authController.signUp);
router.post("/auth/login", authController.login);

module.exports = router;

