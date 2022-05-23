const BeOrder = require("../models/BeOrder");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const jwt = require("jsonwebtoken");

const { valueRequired } = require("../lib/check");

exports.createBeOrder = asyncHandler(async (req, res) => {
  if (valueRequired(req.body.userId)) req.body.createUser = req.body.userId;
  else delete req.body.userId;

  const beorder = await BeOrder.create(req.body);

  res.status(200).json({
    success: true,
    data: beorder,
  });
});

exports.getBeOrders = asyncHandler(async (req, res) => {
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

  const query = BeOrder.find();
  if (valueRequired(name))
    query.find({ title: { $regex: ".*" + name + ".*", $options: "i" } });
  if (valueRequired(status)) query.where("status").equals(status);
  query.populate("createUser");
  query.populate("invoice");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const beorder = await query.exec();

  res.status(200).json({
    success: true,
    count: beorder.length,
    data: beorder,
    pagination,
  });
});

exports.getBeOrder = asyncHandler(async (req, res, next) => {
  const beorder = await BeOrder.findById(req.params.id);
  if (!beorder) {
    throw new MyError("Тухайн захиалга байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: beorder,
  });
});

exports.deleteBeOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const beorder = await BeOrder.findById(id);

  if (!beorder) throw new MyError("Тухайн захиалга олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: beorder,
  });
});

exports.multDeleteBeOrder = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findBeOrders = await BeOrder.find({ _id: { $in: ids } });

  if (findBeOrders.length <= 0) {
    throw new MyError("Таны сонгосон захиалгууд байхгүй байна", 400);
  }

  const beorder = await BeOrder.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: beorder,
  });
});

exports.updateBeOrder = asyncHandler(async (req, res, next) => {
  let beorder = await BeOrder.findById(req.params.id);

  beorder = await BeOrder.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: beorder,
  });
});

exports.getBeOrderUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.autobiztoken;
  const tokenObject = jwt.verify(token, process.env.JWT_SECRET);

  if (req.userId !== tokenObject.id)
    throw new MyError("Уучлаарай хандах боломжгүй байна", 400);

  const order = await BeOrder.find({})
    .where("createUser")
    .equals(req.userId)
    .populate("product_id");

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.getCounBeOrder = asyncHandler(async (req, res, next) => {
  const beorder = await BeOrder.count();
  res.status(200).json({
    success: true,
    data: beorder,
  });
});
