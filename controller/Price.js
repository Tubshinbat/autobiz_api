const Price = require("../models/Price");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createPrice = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;

  const price = await Price.create(req.body);

  res.status(200).json({
    success: true,
    data: price,
  });
});

exports.getPrices = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  let status = req.query.status || null;
  const name = req.query.name;
  console.log(sort);
  if (sort) {
    sort.toString().replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
      return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
    });
    if (typeof sort === "string") {
      sort = JSON.parse(`{ ${sort} }`);
    }
  }

  console.log(sort);

  [("select", "sort", "page", "limit", "status", "name")].forEach(
    (el) => delete req.query[el]
  );

  const query = Price.find();
  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

  query.populate("createUser");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const price = await query.exec();

  res.status(200).json({
    success: true,
    count: price.length,
    data: price,
    pagination,
  });
});

exports.getPrice = asyncHandler(async (req, res, next) => {
  const price = await Price.findById(req.params.id);
  if (!price) {
    throw new MyError("Тухайн үнэ байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: price,
  });
});

exports.deletePrice = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deletePrice = await Price.findById(id);

  if (!deletePrice) throw new MyError("Тухайн үнэ байхгүй байна. ", 404);

  res.status(200).json({
    success: true,
    data: deletePrice,
  });
});

exports.multDeletePrice = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findPrices = await Price.find({ _id: { $in: ids } });

  if (findPrices.length <= 0) {
    throw new MyError("Таны сонгосон үнэ байхгүй байна", 400);
  }

  findPrices.map(async (el) => {
    await imageDelete(el.picture);
  });

  const price = await Price.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: price,
  });
});

exports.updatePrice = asyncHandler(async (req, res, next) => {
  let price = await Price.findById(req.params.id);

  if (!price) {
    throw new MyError("Тухайн үнэ байхгүй байна. ", 404);
  }

  const files = req.files;

  price = await Price.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: price,
  });
});

exports.getCounPrice = asyncHandler(async (req, res, next) => {
  const price = await Price.count();
  res.status(200).json({
    success: true,
    data: price,
  });
});
