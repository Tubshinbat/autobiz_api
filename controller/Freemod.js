const Freemod = require("../models/Freemod");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");

exports.createFreemod = asyncHandler(async (req, res) => {
  const freemod = await Freemod.create(req.body);

  res.status(200).json({
    success: true,
    data: freemod,
  });
});

exports.getFreemods = asyncHandler(async (req, res) => {
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

  const query = Freemod.find();
  if (valueRequired(name))
    query.find({ model: { $regex: ".*" + name + ".*", $options: "i" } });
  if (valueRequired(status)) query.where("status").equals(status);
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const freemod = await query.exec();

  res.status(200).json({
    success: true,
    count: freemod.length,
    data: freemod,
    pagination,
  });
});

exports.getFreemod = asyncHandler(async (req, res, next) => {
  const freemod = await Freemod.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: freemod,
  });
});

exports.deleteFreemod = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteFreemod = await Freemod.findById(id);
  if (!deleteFreemod) throw new MyError("Тухайн арал байхгүй байна. ", 404);

  res.status(200).json({
    success: true,
    data: deleteFreemod,
  });
});

exports.multDeleteFreemod = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findFreemods = await Freemod.find({ _id: { $in: ids } });

  if (findFreemods.length <= 0) {
    throw new MyError("Таны сонгосон арлууд байхгүй байна", 400);
  }

  const freemods = await Freemod.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: freemods,
  });
});

exports.updateFreemod = asyncHandler(async (req, res, next) => {
  let freemod = await Freemod.findById(req.params.id);
  if (!freemod) {
    throw new MyError("Тухайн арал байхгүй байна. ", 404);
  }
  req.body.updateAt = new Date();
  freemod = await Freemod.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: freemod,
  });
});

exports.getCounFreemod = asyncHandler(async (req, res, next) => {
  const freemod = await Freemod.count();
  res.status(200).json({
    success: true,
    data: freemod,
  });
});
