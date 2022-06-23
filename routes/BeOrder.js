const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createBeOrder,
  getBeOrder,
  getBeOrders,
  multDeleteBeOrder,
  updateBeOrder,
  getBeOrderUser,
  getCountBeOrder,
} = require("../controller/BeOrder");

router.route("/").post(createBeOrder).get(getBeOrders);

router.route("/user").get(protect, getBeOrderUser);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountBeOrder);

router.route("/delete").delete(protect, authorize("admin"), multDeleteBeOrder);

router
  .route("/:id")
  .get(getBeOrder)
  .put(protect, authorize("admin", "operator"), updateBeOrder);

module.exports = router;
