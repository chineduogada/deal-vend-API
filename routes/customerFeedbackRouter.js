const authController = require("../controllers/authController");
const customerFeedbackController = require("../controllers/customerFeedbackController");

const router = require("express").Router({ mergeParams: true });

router.route("/").get(...customerFeedbackController.getAllFeedbacks);
router.get("/:id", customerFeedbackController.getFeedback);

router.use(authController.protect, authController.restrictTo("buyer"));

router.post("/", ...customerFeedbackController.createFeedback);

router
  .route("/:id")
  .patch(...customerFeedbackController.updateFeedback)
  .delete(...customerFeedbackController.deleteFeedback);
module.exports = router;
