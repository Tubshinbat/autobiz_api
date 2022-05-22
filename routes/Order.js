const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createOrder,
  getOrder,
  getOrders,
  multDeleteOrder,
  updateOrder,
  getCounOrder,
  getOrderUser,
} = require("../controller/Order");

router
  .route("/")
  .post(createOrder)
  .get(protect, authorize("admin", "operator"), getOrders);

router.route("/user").get(protect, getOrderUser);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounOrder);

router.route("/delete").delete(protect, authorize("admin"), multDeleteOrder);
router
  .route("/:id")
  .get(protect, authorize("admin", "operator"), getOrder)
  .put(protect, authorize("admin", "operator"), updateOrder);

module.exports = router;
