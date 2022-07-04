const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createFreemod,
  getFreemods,
  getCounFreemod,
  deleteFreemod,
  updateFreemod,
  getFreemod,
  multDeleteFreemod,
} = require("../controller/Freemod");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createFreemod)
  .get(getFreemods);

router.route("/count").get(getCounFreemod);
router.route("/delete").delete(protect, authorize("admin"), multDeleteFreemod);

router
  .route("/:id")
  .get(getFreemod)
  .delete(protect, authorize("admin"), deleteFreemod)
  .put(protect, authorize("admin", "operator"), updateFreemod);

module.exports = router;
