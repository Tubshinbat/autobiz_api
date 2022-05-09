const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getCarColor,
  createCarColor,
  getCarColors,
  getCounCarColor,
  updateCarColor,
  multDeleteCarColor,
} = require("../controller/CarColor");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createCarColor)
  .get(getCarColors);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounCarColor);

router.route("/delete").delete(protect, authorize("admin"), multDeleteCarColor);
router
  .route("/:id")
  .get(getCarColor)
  .put(protect, authorize("admin", "operator"), updateCarColor);

module.exports = router;
