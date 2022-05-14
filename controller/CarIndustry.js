const CarIndustry = require("../models/CarIndustry");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createCarIndustry = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;

  const files = req.files;

  if (files)
    if (files.image) {
      const img = await fileUpload(files.image, "carIndustry").catch(
        (error) => {
          throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
        }
      );
      req.body.image = img.fileName;
    }

  const carIndustry = await CarIndustry.create(req.body);

  res.status(200).json({
    success: true,
    data: carIndustry,
  });
});

exports.getCarIndustrys = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  let status = req.query.status || null;
  const name = req.query.name;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = CarIndustry.find();
  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });
  if (valueRequired(status)) query.where("status").equals(status);
  query.sort(sort);

  const result = await query.exec();
  const pagination = await paginate(page, limit, null, result.length);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const carIndustry = await query.exec();

  res.status(200).json({
    success: true,
    count: carIndustry.length,
    data: carIndustry,
    pagination,
  });
});

exports.getCarIndustry = asyncHandler(async (req, res, next) => {
  const carIndustry = await CarIndustry.findById(req.params.id);
  if (!carIndustry) {
    throw new MyError("Тухайн машины үйлдвэрлэгч байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: carIndustry,
  });
});

exports.deleteCarIndustry = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteCarIndustry = await CarIndustry.findByIdAndDelete(id);

  if (!deleteCarIndustry)
    throw new MyError("Тухайн машины үйлдвэрлэгч байхгүй байна. ", 404);

  await imageDelete(deleteCarIndustry.picture);

  res.status(200).json({
    success: true,
    data: deleteCarIndustry,
  });
});

exports.multDeleteCarIndustry = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findCarIndustrys = await CarIndustry.find({ _id: { $in: ids } });

  if (findCarIndustrys.length <= 0) {
    throw new MyError("Таны сонгосон машины үйлдвэрлэгчууд байхгүй байна", 400);
  }

  findCarIndustrys.map(async (el) => {
    await imageDelete(el.image);
  });

  const carIndustry = await CarIndustry.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: carIndustry,
  });
});

exports.updateCarIndustry = asyncHandler(async (req, res, next) => {
  let carIndustry = await CarIndustry.findById(req.params.id);
  let oldImage = req.body.oldImage;

  if (!carIndustry) {
    throw new MyError("Тухайн машины үйлдвэрлэгч байхгүй байна. ", 404);
  }

  const files = req.files;

  if (files) {
    if (files.image) {
      const result = await fileUpload(files.image, "carIndustry").catch(
        (error) => {
          throw new MyError(`Баннер хуулах явцад алдаа гарлаа: ${error} `, 400);
        }
      );
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

  carIndustry = await CarIndustry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: carIndustry,
  });
});

exports.getCounCarIndustry = asyncHandler(async (req, res, next) => {
  const carIndustry = await CarIndustry.count();
  res.status(200).json({
    success: true,
    data: carIndustry,
  });
});
