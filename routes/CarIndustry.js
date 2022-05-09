const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getCarIndustry,
  createCarIndustry,
  getCarIndustrys,
  getCounCarIndustry,
  updateCarIndustry,
  multDeleteCarIndustry,
} = require("../controller/CarIndustry");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createCarIndustry)
  .get(getCarIndustrys);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounCarIndustry);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteCarIndustry);
router
  .route("/:id")
  .get(getCarIndustry)
  .put(protect, authorize("admin", "operator"), updateCarIndustry);

module.exports = router;
