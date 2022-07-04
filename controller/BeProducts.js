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
  let sort = req.query.sort;

  // querys
  if (valueRequired(sort) === false || sort === "new") {
    sort = { createAt: -1 };
  } else if (sort === "old") sort = { createAt: 1 };
  else if (sort === "maxtomin") sort = { price: -1 };
  else if (sort === "mintomax") sort = { price: 1 };
  else sort = { createAt: -1 };

  let status = req.query.status || null;
  const title = req.query.title;
  const make = req.query.make;
  const model = req.query.model;
  let fuel = req.query.fuel;
  const country = req.query.country;
  const fob = req.query.fob;
  const priceText = req.query.pricetext;
  const trans = req.query.trans;
  const type = req.query.type;
  const steering = req.query.steering;

  const minPrice = parseInt(req.query.minPrice) || null;
  const maxPrice = parseInt(req.query.maxPrice) || null;
  const minEngcc = parseInt(req.query.minMotor) || null;
  const maxEngcc = parseInt(req.query.maxMotor) || null;
  const minYear = parseInt(req.query.minYear) || null;
  const maxYear = parseInt(req.query.maxYear) || null;
  const minMil = parseInt(req.query.minMil) || null;
  const maxMil = parseInt(req.query.maxMil) || null;

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

  if (valueRequired(make))
    query.find({ mark_txt: { $regex: ".*" + make + ".*", $options: "i" } });

  if (valueRequired(model))
    query.find({ model: { $regex: ".*" + model + ".*", $options: "i" } });
  if (valueRequired(steering))
    query.find({ steering: { $regex: ".*" + steering + ".*", $options: "i" } });
  if (valueRequired(type))
    query.find({ type_txt: { $regex: ".*" + type + ".*", $options: "i" } });

  if (valueRequired(country))
    query.find({ country: { $regex: ".*" + country + ".*", $options: "i" } });

  if (valueRequired(fob))
    query.find({ location_fob: { $regex: ".*" + fob + ".*", $options: "i" } });

  if (valueRequired(priceText)) query.where("price").equals(priceText);

  if (valueRequired(fuel)) {
    if (fuel === "Hybrid(Petrol)") fuel = "Hybrid (Petrol)";
    if (fuel === "Hybrid(Diesel)") fuel = "Hybrid";
    console.log(fuel);

    query.find({ fuel: { $regex: ".*" + fuel + ".*", $options: "i" } });
  }
  if (valueRequired(trans))
    query.find({ trans: { $regex: ".*" + trans + ".*", $options: "i" } });

  if (valueRequired(status)) query.where("status").equals(status);

  if (valueRequired(minYear) && valueRequired(maxYear)) {
    query.find({
      car_year: { $gte: minYear, $lte: maxYear },
    });
  } else if (valueRequired(maxYear) && valueRequired(minYear) === false)
    query.find({
      car_year: { $lte: maxYear },
    });
  else if (valueRequired(minYear) && valueRequired(maxYear) === false) {
    query.find({
      car_year: { $gte: minYear },
    });
  }

  if (valueRequired(minEngcc) && valueRequired(maxEngcc)) {
    query.find({
      engine: { $gte: minEngcc, $lte: maxEngcc },
    });
  } else if (valueRequired(maxEngcc) && valueRequired(minEngcc) === false)
    query.find({
      engine: { $lte: maxEngcc },
    });
  else if (valueRequired(maxEngcc) === false && valueRequired(minEngcc))
    query.find({
      engine: { $gte: minEngcc },
    });

  if (valueRequired(minMil) && valueRequired(maxMil))
    query.find({
      mileage: { $gte: minMil, $lte: maxMil },
    });
  else if (valueRequired(maxMil) && valueRequired(minMil) === false)
    query.find({
      mileage: { $lte: maxMil },
    });
  else if (valueRequired(maxMil) === false && valueRequired(minMil))
    query.find({
      mileage: { $gte: minMil },
    });

  if (valueRequired(minPrice) && valueRequired(maxPrice))
    query.find({
      price: { $gte: minPrice, $lte: maxPrice },
    });
  else if (valueRequired(maxPrice) && valueRequired(minPrice) === false)
    query.find({
      price: { $lte: maxPrice },
    });
  else if (valueRequired(maxPrice) === false && valueRequired(minPrice))
    query.find({
      price: { $gte: minPrice },
    });

  query.populate("createUser");
  query.sort(sort);
  query.allowDiskUse(true);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const count = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, count);

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

exports.groupFileds = asyncHandler(async (req, res, next) => {
  const groupName = req.params.group;
  const limit = parseInt(req.query.limit) || 100;
  let groupFiled;
  if (valueRequired(groupName)) groupFiled = "$" + groupName;

  const group = await BeProducts.aggregate([
    { $group: { _id: groupFiled, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  res.status(200).json({
    success: true,
    data: group,
  });
});

exports.groupAndfilter = asyncHandler(async (req, res, next) => {
  const groupName = req.query.group;
  const filedName = req.query.filed;
  const filter = req.query.filter;
  let groupFiled;
  const limit = parseInt(req.query.limit) || 100;
  if (valueRequired(groupName)) groupFiled = "$" + groupName;

  let group;
  if (valueRequired(filter)) {
    group = await BeProducts.aggregate([
      { $match: { [filedName]: filter } },
      { $group: { _id: groupFiled, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  } else {
    group = await BeProducts.aggregate([
      { $group: { _id: groupFiled, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  }

  res.status(200).json({
    success: true,
    data: group,
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await BeProducts.findById(req.params.id);
  delete req.body.gallery_images;
  const files = req.files;

  ["price", "mileage", "car_year", "mount", "engine"].map((el) => {
    if (valueRequired(req.body[el])) req.body[el] = parseInt(req.body[el]);
  });

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
