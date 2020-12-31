const router = require("express").Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const factory = require("../controllers/handleFactory");
const User = require("../models/userModel");

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

router.use(authController.protect);

router.patch("/auth/change-my-password", authController.changeMyPassword);

router.get("/me", userController.getMe, factory.getOne(User, "user"));
router.patch("/update-me", userController.updateMe);

router.delete("/delete-me", authController.deactivateAccount);

router.use(authController.restrictTo("admin"));

router
	.route("/")
	.get(userController.getAllUsers)
	.post(userController.createUser);

router
	.route("/:id")
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;

