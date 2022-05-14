const BeProducts = require("../models/BeProducts");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createBeProduct = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || true;
  req.body.createUser = req.userId;

  let fileNames;
  const files = req.files;

  if (files) {
    if (files.pictures.length > 1) {
      fileNames = await multImages(files, Date.now());
    } else {
      fileNames = await fileUpload(files.pictures, Date.now());
      fileNames = [fileNames.fileName];
    }
    req.body.new_images = fileNames;
  }

  const beProducts = await BeProducts.create(req.body);

  res.status(200).json({
    success: true,
    data: beProducts,
  });
});

exports.getBeProducts = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  // querys
  let sort = req.query.sort || { createAt: -1 };
  let status = req.query.status || null;
  const title = req.query.title;
  const make = req.query.make;
  const model = req.query.model;
  const fuel = req.query.fuel;
  const country = req.body.country;
  const fob = req.body.fob;
  const priceText = req.body.pricetext;
  const trans = req.body.trans;
  const type = req.body.type;

  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;
  const minEngcc = req.body.minEngcc;
  const maxEngcc = req.body.maxEngcc;
  const minYear = req.body.minYear;
  const maxYear = req.body.maxYear;
  const minMil = req.body.minMil;
  const maxMil = req.body.maxMil;

  if (typeof sort === "string") {
    sort = JSON.parse("{" + req.query.sort + "}");
  }

  [
    "select",
    "sort",
    "page",
    "limit",
    "status",
    "make",
    "model",
    "fuel",
    "title",
    "minPrice",
    "maxPrice",
    "type",
    "minEngcc",
    "maxEngcc",
    "trans",
    "minYear",
    "maxYear",
    "minMil",
    "maxMil",
    "priceText",
  ].forEach((el) => delete req.query[el]);

  const query = BeProducts.find();

  // Filter
  if (valueRequired(title))
    query.find({ title: { $regex: ".*" + title + ".*", $options: "i" } });

  if (valueRequired(status)) query.where("status").equals(status);

  query.populate("createUser");
  query.sort(sort);

  const result = await BeProducts.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const beProducts = await query.exec();

  res.status(200).json({
    success: true,
    count: beProducts.length,
    data: beProducts,
    pagination,
  });
});

exports.getBeProduct = asyncHandler(async (req, res, next) => {
  const beProduct = await BeProducts.findById(req.params.id);
  if (!beProduct) {
    throw new MyError("Тухайн машин байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: beProduct,
  });
});

exports.deleteBeProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteProducts = await BeProducts.findById(id);

  if (!deleteProducts)
    throw new MyError("Тухайн машинууд байхгүй байна. ", 404);

  await imageDelete(deleteProducts.picture);

  res.status(200).json({
    success: true,
    data: deleteProducts,
  });
});

exports.multDeleteProduct = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findProducts = await BeProducts.find({ _id: { $in: ids } });

  if (findProducts.length <= 0) {
    throw new MyError("Таны сонгосон машинууд байхгүй байна", 400);
  }

  const products = await BeProducts.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: products,
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await BeProducts.findById(req.params.id);
  const files = req.files;

  if (!product) {
    throw new MyError("Тухайн машин байхгүй байна. ", 404);
  }

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  product = await BeProducts.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getCountBeProducts = asyncHandler(async (req, res, next) => {
  const product = await BeProducts.count();
  res.status(200).json({
    success: true,
    data: product,
  });
});
