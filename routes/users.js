const express = require("express");
const router = express.Router();
const { protect, authorize, protectUser } = require("../middleware/protect");

const {
  register,
  login,
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  logout,
  tokenCheckAlways,
  multDeleteUsers,
  adminControlResetPassword,
  updateCuser,
  getCount,
  loginUser,
  changePassword,
  getUseInfo,
  getUseUpdate,

  phoneCheck,
  emailCheck,
  getUserPasswordChange,
} = require("../controller/Users");

const { getOrderUser } = require("../controller/Order");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/logout").get(protect, logout);
router.route("/checktoken").post(tokenCheckAlways);
router.route("/delete").delete(multDeleteUsers);

router.route("/loginuser").post(loginUser);

// LOGIN USER

router.route("/order").get(protect, getOrderUser);

router
  .route("/userdata")
  .get(protect, getUseInfo)
  .put(protect, getUseUpdate)
  .post(protect, getUserPasswordChange);

router
  .route("/admin-reset-password/:id")
  .post(protect, authorize("admin"), adminControlResetPassword);

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createUser)
  .get(protect, authorize("admin", "operator"), getUsers);
router.route("/count").get(protect, getCount);
router.route("/phone").post(phoneCheck);
router.route("/email").post(emailCheck);
router.route("/changepassword").post(changePassword);
router.route("/c/:id").put(protect, updateCuser);

router
  .route("/:id")
  .get(protect, authorize("admin", "operator"), getUser)
  .put(protect, authorize("admin", "operator"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

module.exports = router;
