const News = require("../models/News");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createNews = asyncHandler(async (req, res, next) => {
  const files = req.files;
  let fileNames;

  if (!files) {
    throw new MyError("Мэдээний зураг оруулна уу", 400);
  }

  const news = await News.create(req.body);

  if (files.pictures.length > 1) {
    fileNames = await multImages(files, Date.now());
  } else {
    fileNames = await fileUpload(files.pictures, Date.now());
    fileNames = [fileNames.fileName];
  }

  news.createUser = req.userId;
  news.pictures = fileNames;
  news.save();

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getNews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  let category = req.query.category || null;
  let status = req.query.status || null;
  const name = req.query.name;

  if (!valueRequired(status)) {
    status = null;
  }

  ["select", "sort", "page", "limit", "category", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = News.find();
  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });
  query.populate("categories");
  query.select(select);
  query.sort(sort);

  if (valueRequired(category)) query.where("categories").in(category);
  if (valueRequired(status)) query.where("status").equals(status);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, News, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const news = await query.exec();

  res.status(200).json({
    success: true,
    count: news.length,
    data: news,
    pagination,
  });
});

exports.multDeleteNews = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findNews = await News.find({ _id: { $in: ids } });

  if (findNews.length <= 0) {
    throw new MyError("Таны сонгосон мэдээнүүд байхгүй байна", 400);
  }

  findNews.map(async (el) => {
    await imageDelete(el.pictures);
  });

  const news = await News.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getSingleNews = asyncHandler(async (req, res, next) => {
  const news = await News.findByIdAndUpdate(req.params.id).populate(
    "categories"
  );

  if (!news) {
    throw new MyError("Тухайн мэдээ байхгүй байна. ", 404);
  }

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.updateNews = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id);
  const files = req.files;

  let oldPictures = req.body.oldPicture;

  if (!news) {
    throw new MyError("Тухайн мэдээ байхгүй байна. ", 404);
  }

  if (!req.body.oldPicture && !files) {
    throw new MyError("Та зураг upload хийнэ үү", 400);
  }

  if (files) {
    if (files.pictures) {
      if (files.pictures.length >= 2) {
        fileNames = await multImages(files, "news");
      } else {
        fileNames = await fileUpload(files.pictures, "news");
        fileNames = [fileNames.fileName];
      }
    }
  }

  if (oldPictures) {
    typeof oldPictures != "string"
      ? (req.body.pictures = [...oldPictures, ...fileNames])
      : (req.body.pictures = [oldPictures, ...fileNames]);
  } else {
    req.body.pictures = fileNames;
  }

  if (typeof req.body.categories === "string") {
    req.body.categories = [req.body.categories];
  }

  req.body.updateAt = new Date();
  req.body.updateUser = req.userId;

  news = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getCountNews = asyncHandler(async (req, res, next) => {
  const news = await News.count();
  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getAllNews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const name = req.query.name;
  const select = req.query.select;

  let sort = req.query.sort || { createAt: -1 };
  let category = req.query.category;
  let status = req.query.status || null;

  if (typeof sort === "string") {
    sort = JSON.parse("{" + req.query.sort + "}");
  }

  if (category === "*") {
    category = null;
  }
  if (valueRequired(status)) {
    status = null;
  }

  ["select", "sort", "page", "limit", "category", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = News.find({});
  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });
  query.populate("categories");
  query.populate("createUser");
  query.select(select);
  query.sort(sort);

  if (category !== null) {
    query.where("categories").in(category);
  }
  if (status !== null) {
    query.where("status").equals(status);
  }

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const news = await query.exec();

  res.status(200).json({
    success: true,
    count: news.length,
    data: news,
    pagination,
  });
});

exports.getSlugNews = asyncHandler(async (req, res, next) => {
  const news = await News.findOne({ slug: req.params.slug })
    .populate("categories")
    .populate("createUser");

  if (!news) {
    throw new MyError("Тухайн мэдээ байхгүй байна. ", 404);
  }

  news.views = news.views + 1;
  news.update();

  res.status(200).json({
    success: true,
    data: news,
  });
});
