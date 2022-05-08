const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createProduct,
  getProduct,
  getProducts,
  getCountProduct,
  multDeleteProduct,
  updateProduct,
} = require("../controller/Product");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createProduct)
  .get(getProducts);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountProduct);

router.route("/delete").delete(protect, authorize("admin"), multDeleteProduct);
router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("admin", "operator"), updateProduct);

module.exports = router;
