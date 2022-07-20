const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createHomeCar,
  getHomeCar,
  getHomeCars,
  multDeleteHomeCar,
  updateHomeCar,
  getCounHomeCar,
  getQtySum,
} = require("../controller/HomeCars");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createHomeCar)
  .get(getHomeCars);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounHomeCar);

router.route("/qty").get(protect, authorize("admin", "operator"), getQtySum);

router.route("/delete").delete(protect, authorize("admin"), multDeleteHomeCar);
router
  .route("/:id")
  .get(getHomeCar)
  .put(protect, authorize("admin", "operator"), updateHomeCar);

module.exports = router;
