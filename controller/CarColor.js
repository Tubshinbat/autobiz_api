const CarColor = require("../models/CarColor");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createCarColor = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;
  const files = req.files;
  if (files)
    if (files.image) {
      const img = await fileUpload(files.image, "carColor").catch((error) => {
        throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
      });
      req.body.image = img.fileName;
    }

  const carColor = await CarColor.create(req.body);

  res.status(200).json({
    success: true,
    data: carColor,
  });
});

exports.getCarColors = asyncHandler(async (req, res) => {
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

  const query = CarColor.find();
  if (valueRequired(name)) query.find({ name: { $regex: ".*" + name + ".*" } });
  if (valueRequired(status)) query.where("status").equals(status);
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const carColor = await query.exec();

  res.status(200).json({
    success: true,
    count: carColor.length,
    data: carColor,
    pagination,
  });
});

exports.getCarColor = asyncHandler(async (req, res, next) => {
  const carColor = await CarColor.findById(req.params.id);
  if (!carColor) {
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: carColor,
  });
});

exports.deleteCarColor = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteCarColor = await CarColor.findByIdAndDelete(id);

  if (!deleteCarColor)
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);

  await imageDelete(deleteCarColor.picture);

  res.status(200).json({
    success: true,
    data: deleteCarColor,
  });
});

exports.multDeleteCarColor = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findCarColors = await CarColor.find({ _id: { $in: ids } });

  if (findCarColors.length <= 0) {
    throw new MyError("Таны сонгосон машины төрөлууд байхгүй байна", 400);
  }

  findCarColors.map(async (el) => {
    await imageDelete(el.image);
  });

  const carColor = await CarColor.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: carColor,
  });
});

exports.updateCarColor = asyncHandler(async (req, res, next) => {
  let carColor = await CarColor.findById(req.params.id);
  let oldImage = req.body.oldImage;

  if (!carColor) {
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);
  }

  const files = req.files;

  if (files) {
    if (files.image) {
      const result = await fileUpload(files.image, "carType").catch((error) => {
        throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error} `, 400);
      });
      req.body.image = result.fileName;
      await imageDelete(oldImage);
    } else {
      req.body.image = oldImage;
    }
  } else {
    req.body.image = oldImage;
  }

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  carColor = await CarColor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: carColor,
  });
});

exports.getCounCarColor = asyncHandler(async (req, res, next) => {
  const carColor = await CarColor.count();
  res.status(200).json({
    success: true,
    data: carColor,
  });
});
