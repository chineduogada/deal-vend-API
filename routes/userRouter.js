const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/auth/signup", authController.signUp);

module.exports = router;

