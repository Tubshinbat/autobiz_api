const HomeCars = require("../models/HomeCars");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createHomeCar = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;

  const homeCar = await HomeCars.create(req.body);

  res.status(200).json({
    success: true,
    data: homeCar,
  });
});

exports.getHomeCars = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: 1 };
  let status = req.query.status || null;
  const {
    mark_txt,
    model,
    type_txt,
    minPrice,
    maxPrice,
    minDate,
    maxDate,
    createDate,
  } = req.query;

  if (sort) {
    sort.toString().replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
      return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
    });
    if (typeof sort === "string") {
      sort = JSON.parse(`{ ${sort} }`);
    }
  }

  [("select", "sort", "page", "limit", "status", "name")].forEach(
    (el) => delete req.query[el]
  );

  const query = HomeCars.find();

  if (valueRequired(mark_txt))
    query.find({ mark_txt: { $regex: ".*" + mark_txt + ".*", $options: "i" } });

  if (valueRequired(model))
    query.find({ model: { $regex: ".*" + model + ".*", $options: "i" } });

  if (valueRequired(type_txt))
    query.find({ type_txt: { $regex: ".*" + type_txt + ".*", $options: "i" } });

  if (valueRequired(minDate))
    query.where({
      minDate: minDate,
    });

  if (valueRequired(maxDate))
    query.where({
      maxDate: maxDate,
    });

  if (valueRequired(minPrice))
    query.where({
      minPrice: minPrice,
    });

  if (valueRequired(maxPrice))
    query.where({
      maxPrice: maxPrice,
    });

  // if (valueRequired(createDate))
  //   query.find({
  //     createDate: { $regex: ".*" + createDate + ".*", $options: "i" },
  //   });

  query.populate("createUser");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const homeCar = await query.exec();

  res.status(200).json({
    success: true,
    count: homeCar.length,
    data: homeCar,
    pagination,
  });
});

exports.getHomeCar = asyncHandler(async (req, res, next) => {
  const homeCar = await HomeCars.findById(req.params.id);
  if (!homeCar) {
    throw new MyError("Тухайн үнэ байхгүй байна. ", 404);
  }
  res.status(200).json({
    success: true,
    data: homeCar,
  });
});

exports.deleteHomeCar = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteHomeCar = await HomeCars.findById(id);

  if (!deleteHomeCar) throw new MyError("Тухайн үнэ байхгүй байна. ", 404);

  res.status(200).json({
    success: true,
    data: deleteHomeCar,
  });
});

exports.multDeleteHomeCar = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findHomeCars = await HomeCars.find({ _id: { $in: ids } });

  if (findHomeCars.length <= 0) {
    throw new MyError("Таны сонгосон үнэ байхгүй байна", 400);
  }

  findHomeCars.map(async (el) => {
    await imageDelete(el.picture);
  });

  const homeCar = await HomeCars.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: homeCar,
  });
});

exports.updateHomeCar = asyncHandler(async (req, res, next) => {
  let homeCar = await HomeCars.findById(req.params.id);

  if (!homeCar) {
    throw new MyError("Тухайн үнэ байхгүй байна. ", 404);
  }

  const files = req.files;

  homeCar = await HomeCars.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: homeCar,
  });
});

exports.getQtySum = asyncHandler(async (req, res, next) => {
  const homeCar = await HomeCars.aggregate([
    {
      $group: {
        _id: null,
        totalQty: { $sum: "$quantity" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: homeCar.totalQty,
  });
});

exports.getCounHomeCar = asyncHandler(async (req, res, next) => {
  const homeCar = await HomeCars.count();
  res.status(200).json({
    success: true,
    data: homeCar,
  });
});
