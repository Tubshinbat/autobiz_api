const WebInfo = require("../models/Webinfo");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const { fileUpload, imageDelete } = require("../lib/photoUpload");

exports.createWebInfo = asyncHandler(async (req, res, next) => {
  const files = req.files;
  let logo = "";
  let whiteLogo = "";
  if (files.logo) {
    logo = await fileUpload(files.logo, "logo").catch((error) => {
      throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
    });
  } else {
    throw new MyError("Лого оруулна уу", 402);
  }
  if (files.whiteLogo) {
    whiteLogo = await fileUpload(files.whiteLogo, "whitelogo").catch(
      (error) => {
        throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
      }
    );
  }

  req.body.logo = logo.fileName;
  req.body.whiteLogo = whiteLogo.fileName || "";
  req.body.updateUser = req.userId;

  ["logo", "whiteLogo", "name", "address", "siteInfo", "policy"].forEach(
    (el) => delete req.body[el]
  );

  // console.log(req);

  let webInfo = await WebInfo.create(req.body);

  res.status(200).json({
    success: true,
    data: webInfo,
  });
});

exports.getWebinfo = asyncHandler(async (req, res, next) => {
  const webInfo = await WebInfo.findOne().sort({ updateAt: -1 });
  if (!webInfo) {
    throw new MyError("Хайсан мэдээлэл олдсонгүй", 400);
  }
  res.status(200).json({
    success: true,
    data: webInfo,
  });
});

exports.updateWebInfo = asyncHandler(async (req, res, next) => {
  const files = req.files;

  let logo = req.body.logo;
  let whiteLogo = req.body.whiteLogo;

  let newLogo = "";
  let newWhiteLogo = "";

  if (files) {
    if (files.logo) {
      newLogo = await fileUpload(files.logo, "logo").catch((error) => {
        throw new MyError(`Лого хуулах явцад алдаа гарлаа: ${error}`, 408);
      });
      logo = newLogo.fileName;
    }
    if (files.whiteLogo) {
      newWhiteLogo = await fileUpload(files.whiteLogo, "logo").catch(
        (error) => {
          throw new MyError(`Лого хуулах явцад алдаа гарлаа: ${error}`, 408);
        }
      );
      whiteLogo = newWhiteLogo.fileName;
    }
  }

  req.body.logo = logo;
  req.body.whiteLogo = whiteLogo || "";

  const webInfo = await WebInfo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!webInfo) {
    throw new MyError("Уучлаарай амжилттгүй боллоо", 404);
  }

  res.status(200).json({
    success: true,
    data: webInfo,
  });
});
