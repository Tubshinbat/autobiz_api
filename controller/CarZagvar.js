const CarZagvar = require("../models/CarZagvar");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createCarZagvar = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;

  const files = req.files;

  if (files)
    if (files.image) {
      const img = await fileUpload(files.image, "carZagvar").catch((error) => {
        throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
      });
      req.body.image = img.fileName;
    }

  const carZagvar = await CarZagvar.create(req.body);

  res.status(200).json({
    success: true,
    data: carZagvar,
  });
});

exports.getCarZagvars = asyncHandler(async (req, res) => {
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

  const query = CarZagvar.find();
  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });
  if (valueRequired(status)) query.where("status").equals(status);
  query.sort(sort);
  query.populate("industry");

  const result = await query.exec();
  const pagination = await paginate(page, limit, null, result.length);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const carZagvar = await query.exec();

  res.status(200).json({
    success: true,
    count: carZagvar.length,
    data: carZagvar,
    pagination,
  });
});

exports.getCarZagvar = asyncHandler(async (req, res, next) => {
  const carZagvar = await CarZagvar.findById(req.params.id).populate(
    "industry"
  );
  if (!carZagvar) {
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: carZagvar,
  });
});

exports.deleteCarZagvar = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteCarZagvar = await CarZagvar.findByIdAndDelete(id);

  if (!deleteCarZagvar)
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);

  await imageDelete(deleteCarZagvar.picture);

  res.status(200).json({
    success: true,
    data: deleteCarZagvar,
  });
});

exports.multDeleteCarZagvar = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findCarZagvars = await CarZagvar.find({ _id: { $in: ids } });

  if (findCarZagvars.length <= 0) {
    throw new MyError("Таны сонгосон машины төрөлууд байхгүй байна", 400);
  }

  findCarZagvars.map(async (el) => {
    await imageDelete(el.image);
  });

  const carZagvar = await CarZagvar.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: carZagvar,
  });
});

exports.updateCarZagvar = asyncHandler(async (req, res, next) => {
  let carZagvar = await CarZagvar.findById(req.params.id);
  let oldImage = req.body.oldImage;

  if (!carZagvar) {
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);
  }

  const files = req.files;

  if (files) {
    if (files.image) {
      const result = await fileUpload(files.image, "carZagvar").catch(
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

  carZagvar = await CarZagvar.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: carZagvar,
  });
});

exports.getCounCarZagvar = asyncHandler(async (req, res, next) => {
  const carZagvar = await CarZagvar.count();
  res.status(200).json({
    success: true,
    data: carZagvar,
  });
});
