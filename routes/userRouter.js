const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/auth/signup", authController.signUp);
router.post("/auth/login", authController.login);
router.post(
	"/auth/forgot-password",
	authController.inputEmailAddress,
	authController.forgotPassword
);
router.patch("/auth/reset-password/:token", authController.resetPassword);
router.post(
	"/auth/verify-email",
	authController.inputEmailAddress,
	authController.verifyEmail
);
router.get(
	"/auth/confirm-email-verification/:token",
	authController.confirmEmailVerification
);

router.post(
	"/auth/change-my-password",
	authController.protect,
	authController.changeMyPassword
);

module.exports = router;

