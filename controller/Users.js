const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const paginate = require("../utils/paginate");
const sharp = require("sharp");
const fs = require("fs");
const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

// OldUSer Check
exports.oldUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  let data = false;

  if (!email || !password)
    throw new MyError("Имэйл болон нууц үгээ дамжуулна уу", 400);
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  if (user.oldUserLogin === false) {
    data = true;
  } else {
    data = false;
  }

  res.status(200).json({
    success: true,
    data: data,
  });
});

// Register
exports.register = asyncHandler(async (req, res, next) => {
  req.body.email = req.body.email.toLowerCase();
  const user = await User.create(req.body);

  const jwt = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token: jwt,
    data: user,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  // Оролтыгоо шалгана
  if (!email || !password)
    throw new MyError("Имэйл болон нууц үгээ дамжуулна уу", 400);

  // Тухайн хэрэглэгчийг хайна
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  if (user.oldUserLogin === false)
    throw new MyError(
      "Вэбсайт шинжлэгдсэнтэй холбоотой та нууц үгээ мартсан дээр дарж шинэчлэн үү",
      401
    );

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 402);
  }

  if (user.role === "user") {
    throw new MyError("Уучлаарай нэвтрэх боломжгүй.");
  }

  if (user.status === false) {
    throw new MyError("Уучлаарай таны эрхийг хаасан байна.");
  }

  const token = user.getJsonWebToken();
  req.token = token;
  const cookieOption = {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    httpOnly: false,
  };

  res.status(200).cookie("autobiztoken", token, cookieOption).json({
    success: true,
    token,
    user,
  });
});

exports.loginUser = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  // Оролтыгоо шалгана
  if (!email || !password)
    throw new MyError("Имэйл болон нууц үгээ дамжуулна уу", 400);

  // Тухайн хэрэглэгчийг хайна
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  if (user.oldUserLogin === false)
    throw new MyError(
      "Вэбсайт шинчлэгдсэнтэй холбоотой та нууц үгээ мартсан дээр дарж шинэчлэн үү",
      401
    );

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 402);
  }

  if (user.status === false) {
    throw new MyError("Уучлаарай таны эрхийг хаасан байна.");
  }

  const token = user.getJsonWebToken();
  req.token = token;
  const cookieOption = {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    httpOnly: false,
  };

  res.status(200).cookie("autobiztoken", token, cookieOption).json({
    success: true,
    token,
    user,
  });
});

exports.tokenCheckAlways = asyncHandler(async (req, res, next) => {
  const token = req.cookies.autobiztoken;

  if (!token) {
    throw new MyError("Уучлаарай хандах боломжгүй байна..", 400);
  }

  const tokenObject = jwt.verify(token, process.env.JWT_SECRET);

  req.userId = tokenObject.id;
  req.userRole = tokenObject.role;

  res.status(200).json({
    success: true,
    role: tokenObject.role,
    userId: tokenObject.id,
    avatar: tokenObject.avatar,
    name: tokenObject.name,
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    httpOnly: false,
  };
  res.status(200).cookie("autobiztoken", null, cookieOption).json({
    success: true,
    data: "logout...",
  });
});

exports.emailCheck = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ status: true })
    .where("email")
    .equals(email);

  if (!user) {
    throw new MyError("Уучлаарай И-мэйлээ шалгаад дахин оролдоно уу");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.phoneCheck = asyncHandler(async (req, res) => {
  const phoneNumber = parseInt(req.body.phoneNumber) || 0;
  const user = await User.findOne({ status: true })
    .where("phone")
    .equals(phoneNumber);

  if (!user) {
    throw new MyError("Уучлаарай утасны дугаараа шалгаад дахин оролдоно уу");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const newPassword = req.body.password;
  const userId = req.body.id;
  if (!newPassword) {
    throw new MyError("Нууц үгээ дамжуулна уу.", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new MyError(req.body.email + "Хандах боломжгүй.", 400);
  }

  user.password = req.body.password;
  user.resetPassword = undefined;
  user.resetPasswordExpire = undefined;
  user.createAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  let status = req.query.status || null;
  const name = req.query.name;
  const phone = parseInt(req.query.phone) || null;

  if (typeof sort === "string") {
    sort = JSON.parse("{" + req.query.sort + "}");
  }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = User.find();
  if (valueRequired(name)) {
    query.find({
      $or: [
        { username: { $regex: ".*" + name + ".*", $options: "i" } },
        { lastname: { $regex: ".*" + name + ".*", $options: "i" } },
        { email: { $regex: ".*" + name + ".*", $options: "i" } },
      ],
    });
  }

  if (valueRequired(phone)) {
    query.where("phone").equals(phone);
  }

  query.select(select);
  query.sort(sort);

  if (valueRequired(status)) {
    query.where("status").equals(status);
  }

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, User, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const users = await query.exec();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
    pagination,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new MyError("Тухайн хэрэглэгч олдсонгүй.", 404);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.getCount = asyncHandler(async (req, res, next) => {
  const userCount = await User.count();
  res.status(200).json({
    success: true,
    data: userCount,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  req.body.status = req.body.status || false;
  req.body.role = req.body.role || "user";
  req.body.email = req.body.email.toLowerCase();
  req.body.createUser = req.userId;
  req.body.age = parseInt(req.body.age) || 0;
  req.body.phone = parseInt(req.body.phone) || null;
  req.body.wallet = parseInt(req.body.wallet) || 0;

  const file = req.files;

  // if (req.body.role === "admin" && req.userRole !== "admin") {
  //   throw new MyError("Уучлаарай админ эрх өгөх эрхгүй байна", 400);
  // }

  if (file) {
    const avatar = await fileUpload(file.image, "avatar").catch((error) => {
      throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
    });
    req.body.image = avatar.fileName;
  }

  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  req.body.status = req.body.status || false;
  req.body.role = req.body.role || "user";
  req.body.email = req.body.email.toLowerCase();
  req.body.updateUser = req.userId;
  req.body.age = parseInt(req.body.age) || 0;
  req.body.phone = parseInt(req.body.phone) || null;
  req.body.wallet = parseInt(req.body.wallet) || 0;
  if (valueRequired(req.body.gender) === false) req.body.gender = "other";

  delete req.body.password;
  delete req.body.confirmPassword;

  let avatar = req.body.oldAvatar;
  const file = req.files;

  // if (req.body.role === "admin" && req.userRole !== "admin") {
  //   throw new MyError("Уучлаарай админ эрх өгөх эрхгүй байна", 200);
  // }

  if (file) {
    const resultData = await fileUpload(file.image, "image").catch((error) => {
      throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
    });
    avatar = resultData.fileName;
  }

  req.body.image = avatar;

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй Хэрэглэгч байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateCuser = asyncHandler(async (req, res, next) => {
  req.body.status = req.body.status || false;
  req.body.role = req.body.role || "user";
  req.body.email = req.body.email.toLowerCase();
  req.body.updateUser = req.userId;

  if (req.params.id !== req.userId) {
    throw new MyError("Уучлаарай хандах боломжгүй", 300);
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй Хэрэглэгч байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  user.remove();

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.multDeleteUsers = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findUsers = await User.find({ _id: { $in: ids } });
  // throw new MyError("Зүгээр алдаа гаргамаар байна. ", 404);
  if (findUsers.length <= 0) {
    throw new MyError("Таны сонгосон хэрэглэгчид байхгүй байна", 404);
  }

  findUsers.map((el) => {
    deleteImage(el.avatar);
  });

  const user = await User.deleteMany({ _id: { $in: ids } });
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError(" Имэйл хаягаа дамжуулна уу.", 400);
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new MyError(req.body.email + " Имэйл хаягаа дахин шалгана уу.", 400);
  }

  const resetToken = 100000 + Math.floor(Math.random() * 900000);
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = resetPasswordExpire;

  // await user.save();
  await user.save({ validateBeforeSave: false });

  const message = `Сайн байна уу? Энэ таны баталгаажуулах код <br> <br> ${resetToken}<br> <br> өдрийг сайхан өнгөрүүлээрэй!`;

  // Имэйл илгээнэ
  const info = await sendEmail({
    email: user.email,
    subject: "Нууц үг сэргээх хүсэлт",
    message,
  });

  res.status(200).json({
    success: true,
    resetToken,
    console: message,
    message: "Таны имэйл хаягруу нууц үг солих линк илгээлээ",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.otp || !req.body.password) {
    throw new MyError(
      "Баталгаажуулах код болон шинэж нууц үгээ оруулна уу.",
      400
    );
  }

  const user = await User.findOne({
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new MyError(
      req.body.email + "Баталгаажуулах код хүчингүй байна дахин авна уу.",
      400
    );
  }

  user.password = req.body.password;
  user.oldUserLogin = true;
  user.resetPassword = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = user.getJsonWebToken();
  res.status(200).json({
    success: true,
    token,
    user,
  });
});

exports.adminControlResetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.password) {
    throw new MyError("нууц үгээ дамжуулна уу.", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.body.email + "Токен хүчингүй байна.", 400);
  }

  user.password = req.body.password;
  user.resetPassword = undefined;
  user.resetPasswordExpire = undefined;
  user.createAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

// FILE UPLOAD

const deleteImage = (filePaths) => {
  if (filePaths) {
    const filePath = filePaths;
    try {
      // console.log(filePath);
      fs.unlinkSync(process.env.FILE_AVATAR_UPLOAD_PATH + "/" + filePath);
      fs.unlinkSync(
        process.env.FILE_AVATAR_UPLOAD_PATH + "/150x150/" + filePath
      );
      fs.unlinkSync(
        process.env.FILE_AVATAR_UPLOAD_PATH + "/350x350/" + filePath
      );
      fs.unlinkSync(process.env.FILE_AVATAR_UPLOAD_PATH + "/450/" + filePath);
    } catch (error) {
      console.log(error);
    }
  }
};
