const OrderType = require("../models/OrderType");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const jwt = require("jsonwebtoken");

const { valueRequired } = require("../lib/check");

exports.createOrderType = asyncHandler(async (req, res) => {
  req.body.createAt = req.userId;

  const orderType = await OrderType.create(req.body);

  res.status(200).json({
    success: true,
    data: orderType,
  });
});

exports.getOrderTypes = asyncHandler(async (req, res) => {
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

  const query = OrderType.find();
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

  const orderType = await query.exec();

  res.status(200).json({
    success: true,
    count: orderType.length,
    data: orderType,
    pagination,
  });
});

exports.getOrderType = asyncHandler(async (req, res, next) => {
  const orderType = await OrderType.findById(req.params.id);
  if (!orderType) {
    throw new MyError("Тухайн захиалга байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: orderType,
  });
});

exports.deleteOrderType = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const orderType = await OrderType.findById(id);

  if (!orderType) throw new MyError("Тухайн захиалга олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: orderType,
  });
});

exports.multDeleteOrderType = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findOrderTypes = await OrderType.find({ _id: { $in: ids } });

  if (findOrderTypes.length <= 0) {
    throw new MyError("Таны сонгосон захиалгууд байхгүй байна", 400);
  }

  const orderType = await OrderType.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: orderType,
  });
});

exports.updateOrderType = asyncHandler(async (req, res, next) => {
  let orderType = await OrderType.findById(req.params.id);

  orderType = await OrderType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: orderType,
  });
});

exports.getOrderTypeUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.autobiztoken;
  const tokenObject = jwt.verify(token, process.env.JWT_SECRET);

  if (req.userId !== tokenObject.id)
    throw new MyError("Уучлаарай хандах боломжгүй байна", 400);

  const orderType = await OrderType.find({})
    .where("createUser")
    .equals(req.userId)
    .populate("product_id");

  res.status(200).json({
    success: true,
    data: orderType,
  });
});

exports.getCounOrderType = asyncHandler(async (req, res, next) => {
  const orderType = await OrderType.count();
  res.status(200).json({
    success: true,
    data: orderType,
  });
});
