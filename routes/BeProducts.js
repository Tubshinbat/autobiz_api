const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createBeProduct,
  getBeProduct,
  getBeProducts,
  getCountBeProducts,
  multDeleteProduct,
  updateProduct,
  groupFileds,
} = require("../controller/BeProducts");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createBeProduct)
  .get(getBeProducts);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountBeProducts);

router.route("/delete").delete(protect, authorize("admin"), multDeleteProduct);

router.route("/group/:group").get(groupFileds);
router.route("/groupfilter");

router
  .route("/:id")
  .get(getBeProduct)
  .put(protect, authorize("admin", "operator"), updateProduct);

module.exports = router;
