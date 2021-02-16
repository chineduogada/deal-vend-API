const authController = require("../controllers/authController");
const customerFeedbackController = require("../controllers/customerFeedbackController");
const customerFeedbackMiddleware = require("../middlewares/customerFeedbackMiddleware");

const router = require("express").Router({ mergeParams: true });

router
  .route("/")
  .get(
    customerFeedbackMiddleware.beforeGetAllFeedbacks,
    customerFeedbackController.getAllFeedbacks
  );
router.get("/:id", customerFeedbackController.getFeedback);

router.use(authController.protect, authController.restrictTo("buyer"));

router.post(
  "/",
  customerFeedbackMiddleware.beforeCreateFeedback,
  customerFeedbackController.createFeedback
);

router
  .route("/:id")
  .patch(customerFeedbackController.updateFeedback)
  .delete(customerFeedbackController.deleteFeedback);
module.exports = router;
