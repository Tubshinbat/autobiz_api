const Hybrid = require("../models/Hybrid");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");

exports.createHybrid = asyncHandler(async (req, res) => {
  const hybrid = await Hybrid.create(req.body);

  res.status(200).json({
    success: true,
    data: hybrid,
  });
});

exports.getHybrids = asyncHandler(async (req, res) => {
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

  const query = Hybrid.find();
  if (valueRequired(name)) query.find({ name: { $regex: ".*" + name + ".*" } });
  if (valueRequired(status)) query.where("status").equals(status);
  query.sort(sort);

  const result = await query.exec();
  const pagination = await paginate(page, limit, null, result.length);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const hybrid = await query.exec();

  res.status(200).json({
    success: true,
    count: hybrid.length,
    data: hybrid,
    pagination,
  });
});

exports.getHybrid = asyncHandler(async (req, res, next) => {
  const hybrid = await Hybrid.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: hybrid,
  });
});

exports.deleteHybrid = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteHybrid = await Hybrid.findById(id);
  if (!deleteHybrid) throw new MyError("Тухайн арал байхгүй байна. ", 404);

  res.status(200).json({
    success: true,
    data: deleteHybrid,
  });
});

exports.multDeleteHybrid = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findHybrids = await Hybrid.find({ _id: { $in: ids } });

  if (findHybrids.length <= 0) {
    throw new MyError("Таны сонгосон арлууд байхгүй байна", 400);
  }

  const hybrids = await Hybrid.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: hybrids,
  });
});

exports.updateHybrid = asyncHandler(async (req, res, next) => {
  let hybrid = await Hybrid.findById(req.params.id);
  if (!hybrid) {
    throw new MyError("Тухайн арал байхгүй байна. ", 404);
  }
  req.body.updateAt = new Date();
  hybrid = await Hybrid.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: hybrid,
  });
});

exports.getCounHybrid = asyncHandler(async (req, res, next) => {
  const hybrid = await Hybrid.count();
  res.status(200).json({
    success: true,
    data: hybrid,
  });
});
