const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createHybrid,
  getHybrids,
  getCounHybrid,
  deleteHybrid,
  updateHybrid,
  getHybrid,
} = require("../controller/Hybrid");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createHybrid)
  .get(getHybrids);

router.route("/count").get(getCounHybrid);
router.route("/delete").delete(protect, authorize("admin"), multDeleteHybrid);

router
  .route("/:id")
  .get(getHybrid)
  .delete(protect, authorize("admin"), deleteHybrid)
  .put(protect, authorize("admin", "operator"), updateHybrid);

module.exports = router;
