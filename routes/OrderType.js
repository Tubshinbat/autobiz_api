const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createOrderType,
  getOrderType,
  getOrderTypes,
  multDeleteOrderType,
  updateOrderType,
  getCounOrderType,
  getOrderTypeUser,
} = require("../controller/OrderType");

router
  .route("/")
  .post(createOrderType)
  .get(protect, authorize("admin", "operator"), getOrderTypes);

router.route("/user").get(protect, getOrderTypeUser);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounOrderType);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteOrderType);
router
  .route("/:id")
  .get(protect, authorize("admin", "operator"), getOrderType)
  .put(protect, authorize("admin", "operator"), updateOrderType);

module.exports = router;
