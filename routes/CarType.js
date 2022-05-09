const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getCarType,
  createCarType,
  getCarTypes,
  getCounCarType,
  updateCarType,
  multDeleteCarType,
} = require("../controller/CarType");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createCarType)
  .get(getCarTypes);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounCarType);

router.route("/delete").delete(protect, authorize("admin"), multDeleteCarType);
router
  .route("/:id")
  .get(getCarType)
  .put(protect, authorize("admin", "operator"), updateCarType);

module.exports = router;
