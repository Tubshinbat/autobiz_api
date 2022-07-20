const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createPrice,
  getPrice,
  getPrices,
  multDeletePrice,
  updatePrice,
  getCounPrice,
} = require("../controller/Price");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createPrice)
  .get(getPrices);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounPrice);

router.route("/delete").delete(protect, authorize("admin"), multDeletePrice);
router
  .route("/:id")
  .get(getPrice)
  .put(protect, authorize("admin", "operator"), updatePrice);

module.exports = router;
