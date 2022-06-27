const Banner = require("../models/Banner");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createBanner = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;

  const files = req.files;
  if (!files || !files.banner) throw new MyError("Баннер зураг оруулна уу");

  if (files.banner) {
    const banner = await fileUpload(files.banner, "banner").catch((error) => {
      throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
    });
    req.body.picture = banner.fileName;
  }

  const banner = await Banner.create(req.body);

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.getBanners = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  let status = req.query.status || nul;
  const name = req.query.name;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Banner.find();
  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });
  if (valueRequired(status)) query.where("status").equals(status);
  query.populate("createUser");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const banner = await query.exec();

  res.status(200).json({
    success: true,
    count: banner.length,
    data: banner,
    pagination,
  });
});

exports.getBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw new MyError("Тухайн баннер байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteBanner = await Banner.findById(id);

  if (!deleteBanner) throw new MyError("Тухайн баннер байхгүй байна. ", 404);

  await imageDelete(deleteBanner.picture);

  res.status(200).json({
    success: true,
    data: deleteBanner,
  });
});

exports.multDeleteBanner = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findBanners = await Banner.find({ _id: { $in: ids } });

  if (findBanners.length <= 0) {
    throw new MyError("Таны сонгосон баннерууд байхгүй байна", 400);
  }

  findBanners.map(async (el) => {
    await imageDelete(el.picture);
  });

  const banner = await Banner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.updateBanner = asyncHandler(async (req, res, next) => {
  let banner = await Banner.findById(req.params.id);
  let oldBanner = req.body.oldBanner;

  if (!banner) {
    throw new MyError("Тухайн баннер байхгүй байна. ", 404);
  }

  const files = req.files;

  if (!oldBanner && !files) {
    throw new MyError("Та баннераа оруулна уу", 400);
  }
  if (files) {
    if (files.banner) {
      const result = await fileUpload(files.banner, "banner").catch((error) => {
        throw new MyError(`Баннер хуулах явцад алдаа гарлаа: ${error} `, 400);
      });
      req.body.picture = result.fileName;
      await imageDelete(oldBanner);
    }
  } else {
    req.body.picture = oldBanner;
  }

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.getCounBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.count();
  res.status(200).json({
    success: true,
    data: banner,
  });
});
