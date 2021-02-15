const authController = require("../controllers/authController");
const customerFeedbackController = require("../controllers/customerFeedbackController");

const router = require("express").Router({ mergeParams: true });

router
  .route("/")
  .get(customerFeedbackController.getAllFeedbacks)
  .post(
    authController.protect,
    authController.restrictTo("buyer"),
    customerFeedbackController.createFeedback
  );

module.exports = router;
