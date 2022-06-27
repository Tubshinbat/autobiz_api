const Order = require("../models/Order");
const Users = require("../models/User");
const Products = require("../models/Product");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const jwt = require("jsonwebtoken");

const { valueRequired } = require("../lib/check");
const { query } = require("express");

exports.createOrder = asyncHandler(async (req, res) => {
  req.body.createAt = req.UserId;
  let d = new Date();
  const orderCount = await Order.find({}).count();
  let year = d.getFullYear();
  let month = d.getMonth();
  year = year.toString().substr(-2);
  month = (month + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }

  req.body.orderNumber = `B${year}${month}${orderCount + 1}`;

  const order = await Order.create(req.body);

  res.status(200).json({
    success: true,
    data: order,
  });
});

const userNameSearch = async (name) => {
  const users = await Users.find({
    firstname: { $regex: ".*" + name + ".*", $options: "i" },
  })
    .select("_id")
    .limit(25);

  return users;
};

const productNameSearch = async (name) => {
  const products = await Products.find({
    title: { $regex: ".*" + name + ".*", $options: "i" },
  })
    .select("_id")
    .limit(25);

  return products;
};

exports.getOrders = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };

  const name = req.query.name;
  const orderNumber = req.query.ordernumber;
  const user = req.query.user;
  const orderType = req.query.ordertype || nul;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Order.find();

  if (valueRequired(user)) {
    const searchUsers = await userNameSearch(user);
    if (searchUsers) query.where("userId").in(searchUsers);
  }

  if (valueRequired(name)) {
    const products = await productNameSearch(name);
    if (products) query.where("product_id").in(products);
  }

  if (valueRequired(orderNumber))
    query.find({
      orderNumber: { $regex: ".*" + orderNumber + ".*", $options: "i" },
    });

  if (valueRequired(orderType)) query.where("orderType").equals(orderType);

  query
    .populate("createUser")
    .populate("product_id")
    .populate("userId")
    .populate("orderType");

  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const order = await query.exec();

  res.status(200).json({
    success: true,
    count: order.length,
    data: order,
    pagination,
  });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("product_id")
    .populate("userId");
  if (!order) {
    throw new MyError("Тухайн захиалга байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.deleteOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const order = await Order.findById(id);

  if (!order) throw new MyError("Тухайн захиалга олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.multDeleteOrder = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findOrders = await Order.find({ _id: { $in: ids } });

  if (findOrders.length <= 0) {
    throw new MyError("Таны сонгосон захиалгууд байхгүй байна", 400);
  }

  const order = await Order.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.updateOrder = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  let order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.getOrderUser = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  let sort = req.query.sort || { createAt: -1 };
  let orderType = req.query.ordertype || nul;
  const orderNumber = req.query.ordernumber;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "ordertype", "ordernumber"].forEach(
    (el) => delete req.query[el]
  );

  const query = Order.find({});
  if (valueRequired(orderType)) query.where("orderType", orderType);
  if (valueRequired(orderNumber))
    query.find({
      orderNumber: { $regex: ".*" + orderNumber + ".*", $options: "i" },
    });

  query
    .where("userId")
    .equals(req.userId)
    .populate("product_id")
    .populate("orderType");

  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const order = await query.exec();

  res.status(200).json({
    success: true,
    count: order.length,
    data: order,
    pagination,
  });
});

exports.getCounOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.count();
  res.status(200).json({
    success: true,
    data: order,
  });
});
