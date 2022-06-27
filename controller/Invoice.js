const Invoice = require("../models/Invoice");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { valueRequired } = require("../lib/check");

exports.createInvoice = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;

  // Convert PDF hiine
  const invoice = await Invoice.create(req.body);

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

exports.getInvoices = asyncHandler(async (req, res) => {
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

  const query = Invoice.find();
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

  const invoice = await query.exec();

  res.status(200).json({
    success: true,
    count: invoice.length,
    data: invoice,
    pagination,
  });
});

exports.getInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    throw new MyError("Тухайн захиалга байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: invoice,
  });
});

exports.deleteInvoice = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const invoice = await Invoice.findById(id);

  if (!invoice) throw new MyError("Тухайн захиалга олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

exports.multDeleteInvoice = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findInvoices = await Invoice.find({ _id: { $in: ids } });

  if (findInvoices.length <= 0) {
    throw new MyError("Таны сонгосон захиалгууд байхгүй байна", 400);
  }

  const invoice = await Invoice.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

exports.updateInvoice = asyncHandler(async (req, res, next) => {
  let invoice = await Invoice.findById(req.params.id);

  invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

exports.getCounInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.count();
  res.status(200).json({
    success: true,
    data: invoice,
  });
});
