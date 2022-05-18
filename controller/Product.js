const Product = require("../models/Product");
const CarZagvar = require("../models/CarZagvar");
const CarIndustry = require("../models/CarIndustry");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createProduct = asyncHandler(async (req, res, next) => {
  const files = req.files;
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;
  let fileNames;

  if (!files) {
    throw new MyError("Машины зураг оруулна уу", 400);
  }

  if (files.pictures.length > 1) {
    fileNames = await multImages(files, "product");
  } else {
    fileNames = await fileUpload(files.pictures, "product");
    fileNames = [fileNames.fileName];
  }

  const product = await Product.create(req.body);

  product.createUser = req.userId;
  product.pictures = fileNames;
  product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getProducts = asyncHandler(async (req, res, next) => {
  // const page = parseInt(req.query.page) || 1;
  // const limit = parseInt(req.query.limit) || 24;
  // let sort = req.query.sort;
  // const select = req.query.select;
  // let status = req.query.status || "null";
  // const name = req.query.name;
  // const markName = req.query.mark_name;
  // const zagvarName = req.query.zagvar_name;

  // if (valueRequired(sort) === false || sort === "new") {
  //   sort = { createAt: -1 };
  // } else if (sort === "old") sort = { createAt: 1 };
  // else if (sort === "maxtomin") sort = { price: -1 };
  // else if (sort === "mintomax") sort = { price: 1 };
  // else sort = { createAt: -1 };

  // [("select", "sort", "page", "limit", "status", "name")].forEach(
  //   (el) => delete req.query[el]
  // );

  // const minYear = parseInt(req.query.minYear) || null;
  // const maxYear = parseInt(req.query.maxYear) || null;

  const query = await Product.find();

  query.forEach((p) => {
    (p.make_date = parseInt(p.make_date)),
      (p.import_date = parseInt(p.import_date)),
      (p.price = parseInt(p.price)),
      (p.car_motor = parseInt(p.car_motor)),
      (p.car_km = parseInt(p.car_km)),
      query.save(p);
  });

  // query.populate("car_industry");
  // query.populate("car_zagvar");
  // query.populate("car_type");

  // if (valueRequired(name)) {
  //   let regName = new RegExp(name, "i");

  //   query.find({
  //     title: { $regex: regName },
  //   });
  // }

  // if (valueRequired(markName)) {
  //   let regMark = new RegExp(markName, "i");

  //   const carIndustry = await CarIndustry.findOne({
  //     name: { $regex: regMark },
  //   }).select("_id");

  //   query.find({
  //     car_industry: carIndustry._id || "",
  //   });
  // }

  // if (valueRequired(zagvarName)) {
  //   let regZagvar = new RegExp(zagvarName, "i");

  //   const carZagvar = await CarZagvar.findOne({
  //     name: { $regex: regZagvar },
  //   }).select("_id");

  //   query.find({
  //     car_zagvar: carZagvar._id || "",
  //   });
  // }

  // query.select(select);
  // query.sort(sort);

  // if (valueRequired(status)) query.where("status").equals(status);

  // if (valueRequired(req.query.industry))
  //   query.where("car_industry").equals(req.query.industry);

  // if (valueRequired(req.query.carType))
  //   query.where("car_type").equals(req.query.carType);
  // if (valueRequired(req.query.color))
  //   query.where("color").equals(req.query.color);
  // if (valueRequired(req.query.car_hurd))
  //   query.where("car_hurd").equals(req.query.car_hurd);
  // if (valueRequired(req.query.car_shatakhuun))
  //   query.where("car_shatakhuun").equals(req.query.car_shatakhuun);
  // if (valueRequired(req.query.car_speed_box))
  //   query.where("car_speed_box").equals(req.query.car_speed_box);
  // if (valueRequired(req.query.lizing))
  //   query.where("lizing").equals(req.query.lizing);

  // if (valueRequired(minYear) && valueRequired(maxYear)) {
  // const yearConvert = {
  //   $addFields: {
  //     convertedYear: { $toInt: "$make_date" },
  //   },
  // };

  // query.aggregate([yearConvert]);

  //     query.find({
  //       make_date: { $gte: minYear, $lte: maxYear },
  //     });
  //   } else if (valueRequired(maxYear) && valueRequired(minYear) === false)
  //     query.find({
  //       make_date: { $gte: maxYear },
  //     });
  //   else if (valueRequired(minYear) && valueRequired(maxYear) === false)
  //     query.find({
  //       make_date: { $lte: minYear },
  //     });

  //   if (valueRequired(req.query.minMotor) && valueRequired(req.query.maxMotor))
  //     query.find({
  //       car_motor: { $gte: req.query.minMotor, $lte: req.query.maxMotor },
  //     });
  //   else if (
  //     valueRequired(req.query.maxMotor) &&
  //     valueRequired(req.query.minMotor) === false
  //   )
  //     query.find({
  //       car_motor: { $gte: req.query.maxMotor },
  //     });
  //   else if (
  //     valueRequired(req.query.maxMotor) &&
  //     valueRequired(req.query.minMotor) === false
  //   )
  //     query.find({
  //       car_motor: { $lte: req.query.minMotor },
  //     });

  //   const qc = query.toConstructor();
  //   const clonedQuery = new qc();
  //   const result = await clonedQuery.count();

  //   const pagination = await paginate(page, limit, null, result);
  //   query.limit(limit);
  //   query.skip(pagination.start - 1);
  //   const product = await query.exec();

  //   res.status(200).json({
  //     success: true,
  //     count: product.length,
  //     data: product,
  //     pagination,
  //   });
  // });

  // exports.multDeleteProduct = asyncHandler(async (req, res, next) => {
  //   const ids = req.queryPolluted.id;
  //   const findProducts = await Product.find({ _id: { $in: ids } });

  //   if (findProducts.length <= 0) {
  //     throw new MyError("Таны сонгосон бүтээгдэхүүнд байхгүй байна", 400);
  //   }

  //   findProducts.map(async (el) => {
  //     await imageDelete(el.pictures);
  //   });

  //   const product = await Product.deleteMany({ _id: { $in: ids } });

  //   res.status(200).json({
  //     success: true,
  //   });
  // });

  // exports.getProduct = asyncHandler(async (req, res, next) => {
  //   const product = await Product.findById(req.params.id).populate("menu");

  //   if (!product) {
  //     throw new MyError("Тухайн мэдээ байхгүй байна. ", 404);
  //   }

  //   res.status(200).json({
  //     success: true,
  //     data: product,
  //   });
  // });

  // exports.updateProduct = asyncHandler(async (req, res, next) => {
  //   let product = await Product.findById(req.params.id);

  //   let fileNames = [];
  //   let oldFiles = req.body.oldPicture || null;

  //   req.body.car_motor = parseInt(req.body.car_motor) || 0;
  //   req.body.car_km = parseInt(req.body.car_km) || 0;
  //   req.body.price = parseInt(req.body.price) || null;

  //   if (!product) {
  //     throw new MyError("Тухайн мэдээ байхгүй байна. ", 404);
  //   }

  //   const files = req.files;

  //   if (!req.body.oldPicture && !files) {
  //     throw new MyError("Та зураг upload хийнэ үү", 400);
  //   }

  //   if (files) {
  //     if (files.pictures.length >= 2) {
  //       fileNames = await multImages(files, "product");
  //     } else {
  //       fileNames = await fileUpload(files.pictures, "product");
  //       fileNames = [fileNames.fileName];
  //     }
  //   }
  //   if (oldFiles === null) {
  //     req.body.pictures = [...fileNames];
  //   } else {
  //     typeof oldFiles != "string"
  //       ? (req.body.pictures = [...oldFiles, ...fileNames])
  //       : (req.body.pictures = [oldFiles, ...fileNames]);
  //   }

  //   if (typeof req.body.menu === "string") {
  //     req.body.menu = [req.body.menu];
  //   }

  //   req.body.updateAt = new Date();
  //   req.body.updateUser = req.userId;

  //   product = await Product.findByIdAndUpdate(req.params.id, req.body, {
  //     new: true,
  //     runValidators: true,
  //   });

  res.status(200).json({
    success: true,
    // data: product,
  });
});

exports.groupFileds = asyncHandler(async (req, res, next) => {
  const groupName = req.params.group;
  const limit = parseInt(req.query.limit) || 100;
  let groupFiled;
  if (groupName) groupFiled = "$" + groupName;

  const group = await Product.aggregate([
    { $group: { _id: groupFiled, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: limit },
    {
      $project: {
        name: "$_id",
        count: "$count",
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: group,
  });
});

exports.getCountProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.count();
  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getSlugProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    "createUser"
  );

  if (!product) {
    throw new MyError("Тухайн бүтээгдэхүүн байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});
