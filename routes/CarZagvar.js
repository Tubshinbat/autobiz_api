const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getCarZagvar,
  createCarZagvar,
  getCarZagvars,
  getCounCarZagvar,
  updateCarZagvar,
  multDeleteCarZagvar,
} = require("../controller/CarZagvar");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createCarZagvar)
  .get(getCarZagvars);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounCarZagvar);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteCarZagvar);
router
  .route("/:id")
  .get(getCarZagvar)
  .put(protect, authorize("admin", "operator"), updateCarZagvar);

module.exports = router;
