const Product = require("../models/Product");
const CarZagvar = require("../models/CarZagvar");
const CarIndustry = require("../models/CarIndustry");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createProduct = asyncHandler(async (req, res, next) => {
  const files = req.files;
  req.body.status = req.body.status || false;
  let fileNames;

  if (!files) {
    throw new MyError("Машины зураг оруулна уу", 400);
  }

  if (files.pictures.length > 1) {
    fileNames = await multImages(files, "product");
  } else {
    fileNames = await fileUpload(files.pictures, "product");
    fileNames = [fileNames.fileName];
  }

  const product = await Product.create(req.body);

  product.createUser = req.userId;
  product.pictures = fileNames;
  product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  let status = req.query.status || "null";
  const name = req.query.name;

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Product.find();
  query.populate("car_industry");
  query.populate("car_zagvar");
  query.populate("car_type");

  if (valueRequired(name)) {
    let term = new RegExp(name, "i");

    const carZagvar = await CarZagvar.find({ name: { $regex: term } }).select(
      "_id"
    );
    const carIndustry = await CarIndustry.find({
      name: { $regex: term },
    }).select("_id");

    console.log(carZagvar);
    console.log(carIndustry);

    query.find({
      title: { $regex: term },
    });
    if (carZagvar.length > 0) {
      query.where("car_zagvar").in(Object.values(carZagvar));
    }
    if (carIndustry.length > 0)
      query.where("car_industry").in(Object.values(carIndustry));
  }

  query.select(select);
  query.sort(sort);

  if (valueRequired(status)) query.where("status").equals(status);

  const result = await query.exec();
  const pagination = await paginate(page, limit, Product, result.length);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const product = await query.exec();

  res.status(200).json({
    success: true,
    count: product.length,
    data: product,
    pagination,
  });
});

exports.multDeleteProduct = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findProducts = await Product.find({ _id: { $in: ids } });

  if (findProducts.length <= 0) {
    throw new MyError("Таны сонгосон бүтээгдэхүүнд байхгүй байна", 400);
  }

  findProducts.map(async (el) => {
    await imageDelete(el.pictures);
  });

  const product = await Product.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("menu");

  if (!product) {
    throw new MyError("Тухайн мэдээ байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  let fileNames = [];
  let oldFiles = req.body.oldPicture || null;

  if (!product) {
    throw new MyError("Тухайн мэдээ байхгүй байна. ", 404);
  }

  const files = req.files;

  if (!req.body.oldPicture && !files) {
    throw new MyError("Та зураг upload хийнэ үү", 400);
  }

  if (files) {
    if (files.pictures.length >= 2) {
      fileNames = await multImages(files, "product");
    } else {
      fileNames = await fileUpload(files.pictures, "product");
      fileNames = [fileNames.fileName];
    }
  }
  if (oldFiles === null) {
    req.body.pictures = [...fileNames];
  } else {
    typeof oldFiles != "string"
      ? (req.body.pictures = [...oldFiles, ...fileNames])
      : (req.body.pictures = [oldFiles, ...fileNames]);
  }

  if (typeof req.body.menu === "string") {
    req.body.menu = [req.body.menu];
  }

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getCountProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.count();
  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getSlugProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    "createUser"
  );

  if (!product) {
    throw new MyError("Тухайн бүтээгдэхүүн байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});
