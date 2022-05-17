const CarType = require("../models/CarType");
const Product = require("../models/Product");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createCarType = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;

  const files = req.files;

  if (files)
    if (files.image) {
      const img = await fileUpload(files.image, "carType").catch((error) => {
        throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
      });
      req.body.image = img.fileName;
    }

  const carType = await CarType.create(req.body);

  res.status(200).json({
    success: true,
    data: carType,
  });
});

exports.getCarTypes = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  let status = req.query.status || null;
  const name = req.query.name;
  req.body.createUser = req.userId;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = CarType.find();
  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });
  if (valueRequired(status)) query.where("status").equals(status);
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const carType = await query.exec();

  const products = await Product.aggregate([
    { $group: { _id: "$car_type", sum: { $sum: 1 } } },
    {
      $lookup: {
        from: "cartypes",
        localField: "_id",
        foreignField: "_id",
        as: "types",
      },
    },
    { $sort: { sum: -1 } },
    {
      $unwind: "$types",
    },
    {
      $project: {
        type_id: "$_id",
        typeCount: "$sum",
        type: "$types.name",
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: carType.length,
    data: carType,
    pagination,
    products,
  });
});

exports.getCarType = asyncHandler(async (req, res, next) => {
  const carType = await CarType.findById(req.params.id);
  if (!carType) {
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: carType,
  });
});

exports.deleteCarType = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteCarType = await CarType.findByIdAndDelete(id);

  if (!deleteCarType)
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);

  await imageDelete(deleteCarType.picture);

  res.status(200).json({
    success: true,
    data: deleteCarType,
  });
});

exports.multDeleteCarType = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findCarTypes = await CarType.find({ _id: { $in: ids } });

  if (findCarTypes.length <= 0) {
    throw new MyError("Таны сонгосон машины төрөлууд байхгүй байна", 400);
  }

  findCarTypes.map(async (el) => {
    await imageDelete(el.image);
  });

  const carType = await CarType.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: carType,
  });
});

exports.updateCarType = asyncHandler(async (req, res, next) => {
  let carType = await CarType.findById(req.params.id);
  let oldImage = req.body.oldImage;

  if (!carType) {
    throw new MyError("Тухайн машины төрөл байхгүй байна. ", 404);
  }

  const files = req.files;

  if (files) {
    if (files.image) {
      const result = await fileUpload(files.image, "carType").catch((error) => {
        throw new MyError(`Баннер хуулах явцад алдаа гарлаа: ${error} `, 400);
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

  carType = await CarType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: carType,
  });
});

exports.getCounCarType = asyncHandler(async (req, res, next) => {
  const carType = await CarType.count();
  res.status(200).json({
    success: true,
    data: carType,
  });
});
