const News = require("../models/News");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const moment = require("moment-timezone");
const dateUlaanbaatar = moment.tz(Date.now(), "Asia/Ulaanbaatar");
const { valueRequired } = require("../lib/check");

exports.createNews = asyncHandler(async (req, res, next) => {
  const files = req.files;
  let fileNames, videoNames, audioNames;
  const language = req.cookies.language || "mn";
  const name = req.body.name;
  const details = req.body.details;
  const shortDetails = req.body.shortDetails;
  ["language", "shrotDetails", "name", "details"].map(
    (data) => delete req.body[data]
  );
  req.body[language] = {
    name,
    details,
    shortDetails,
  };
  if (!files) {
    throw new MyError("Мэдээний зураг оруулна уу", 400);
  }

  if (!files.pictures) {
    throw new MyError("Мэдээний зураг оруулна уу", 400);
  }

  const news = await News.create(req.body);
  if (files.pictures.length >= 2) {
    fileNames = await multImages(files, Date.now());
  } else {
    fileNames = await fileUpload(files.pictures, Date.now());
    fileNames = [fileNames.fileName];
  }

  if (files.videos) {
    if (files.videos.length >= 2) {
      videoNames = await multFile(files.videos, Date.now());
    } else {
      videoNames = await fileUpload(files.videos, Date.now(), false);
      videoNames = [videoNames.fileName];
    }
  }

  if (files.audios) {
    if (files.audios.length >= 2) {
      audioNames = await multFile(files.audios, Date.now());
    } else {
      audioNames = await fileUpload(files.audios, Date.now(), false);
      audioNames = [audioNames.fileName];
    }
  }

  if (req.body.type === "audio" && audioNames) {
    news.audios = audioNames;
  }

  if (req.body.type === "video" && videoNames) {
    news.videos = videoNames;
  }

  news.createUser = req.userId;
  news.pictures = fileNames;
  news.createAt = dateUlaanbaatar.format();
  news.save();
  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getNews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  let category = req.query.category || null;
  let status = req.query.status || null;
  let star = req.query.star || null;
  const name = req.query.name;
  const sortNews = req.query.sortNews;
  let nameSearch = {};
  if (name === "" || name === null || name === undefined) {
    nameSearch = { $regex: ".*" + ".*" };
  } else {
    nameSearch = { $regex: ".*" + name + ".*" };
  }
  [
    "select",
    "sort",
    "page",
    "limit",
    "category",
    "status",
    "name",
    "star",
    "sortNews",
  ].forEach((el) => delete req.query[el]);

  if (valueRequired(sortNews)) {
    if (sortNews === "views") sort = { views: -1 };
    if (sortNews === "star") star = "true";
    if (sortNews === "last") sort = { createAt: -1 };
  }

  const query = News.find();
  query.find({ $or: [{ "eng.name": nameSearch }, { "mn.name": nameSearch }] });
  query.populate("categories");
  query.select(select);
  query.sort(sort);

  if (valueRequired(category)) query.where("categories").in(category);
  if (valueRequired(status)) query.where("status").equals(status);
  if (valueRequired(star)) query.where("star").equals(star);

  const news2 = await query.exec();

  const pagination = await paginate(page, limit, News, news2.length);
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
  const language = req.cookies.language || "mn";
  const name = req.body.name;
  const details = req.body.details;
  const shortDetails = req.body.shortDetails;

  ["shortDetails", "name", "details"].map((el) => delete req.body[el]);
  language === "eng" ? delete req.body.mn : delete req.body.eng;

  req.body[language] = {
    name,
    details,
    shortDetails,
  };

  let news = await News.findById(req.params.id);
  let fileNames = [];
  let videoNames, audioNames;
  let oldFiles = req.body.oldPicture;
  let oldVideos = req.body.oldVideos;
  let oldAudios = req.body.oldAudios;

  req.body.videos = req.body.oldVideos;
  req.body.audios = req.body.oldAudios;

  if (!news) {
    throw new MyError("Тухайн мэдээ байхгүй байна. ", 404);
  }

  const files = req.files;
  if (!req.body.oldPicture && !files) {
    throw new MyError("Та зураг upload хийнэ үү", 400);
  }

  if (!req.body.oldPicture) {
    if (!files.pictures) {
      throw new MyError("Та зураг upload хийнэ үү", 400);
    }
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
    if (files.videos) {
      if (files.videos.length >= 2) {
        videoNames = await multFile(files.videos, Date.now());
      } else {
        videoNames = await fileUpload(files.videos, Date.now(), false);
        videoNames = [videoNames.fileName];
      }
    }

    if (files.audios) {
      if (files.audios.length >= 2) {
        audioNames = await multFile(files.audios, Date.now());
      } else {
        audioNames = await fileUpload(files.audios, Date.now(), false);
        audioNames = [audioNames.fileName];
      }
    }
  }

  typeof oldFiles != "string"
    ? (req.body.pictures = [...oldFiles, ...fileNames])
    : (req.body.pictures = [oldFiles, ...fileNames]);

  if (oldVideos && typeof oldVideos != "string" && videoNames) {
    req.body.vidoes = [...oldVideos, ...videoNames];
  }

  if (oldVideos && typeof oldVideos === "string") {
    if (videoNames) {
      req.body.videos = [oldVideos, ...videoNames];
    } else {
      req.body.videos = [oldVideos];
    }
  } else if (videoNames) {
    req.body.videos = [...videoNames];
  }

  if (oldAudios && typeof oldAudios != "string" && audioNames) {
    req.body.audios = [...oldAudios, ...audioNames];
  }

  if (oldAudios && typeof oldAudios === "string") {
    if (audioNames) {
      req.body.audios = [oldAudios, ...audioNames];
    } else {
      req.body.audios = [oldAudios];
    }
  } else if (audioNames) {
    req.body.audios = [...audioNames];
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
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  let category = req.query.category;
  let status = req.query.status || "";
  const name = req.query.name;
  let nameSearch = {};

  if (typeof sort === "string") {
    sort = JSON.parse("{" + req.query.sort + "}");
  }

  if (category === "*") {
    category = null;
  }
  if (
    status === "*" ||
    status === "" ||
    status === undefined ||
    status === null ||
    status === "undefined"
  ) {
    status = null;
  } else {
    if (status === true) status = true;
    if (status === false) status = false;
  }

  if (name === "" || name === null || name === undefined) {
    nameSearch = { $regex: ".*" + ".*" };
  } else {
    nameSearch = { $regex: ".*" + name + ".*" };
  }

  ["select", "sort", "page", "limit", "category", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = News.find({ $text: { $search: nameSearch } });

  query.populate("categories");
  query.populate("createUser");
  query.select(select);
  query.sort(sort);

  if (category) {
    query.where("categories").in(category);
  }
  if (status) {
    query.where("status").equals(status);
  }

  const news2 = await query.exec();

  const query2 = News.find({ $text: { $search: nameSearch } });

  query2.populate("categories");
  query2.populate("createUser");
  query2.select(select);
  query2.sort(sort);

  if (category) {
    query2.where("categories").in(category);
  }
  if (status) {
    query2.where("status").equals(status);
  }

  const pagination = await paginate(page, limit, null, news2.length);
  query2.skip(pagination.start - 1);
  query2.limit(limit);

  const news = await query2.exec();

  res.status(200).json({
    success: true,
    count: news.length,
    data: news,
    pagination,
  });
});

exports.getTags = asyncHandler(async (req, res, next) => {
  let agg = [{ $group: { _id: { tags: "$tags" } } }];
  const tags = await News.aggregate(agg);
  res.status(200).json({
    success: true,
    data: tags,
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

exports.updateView = asyncHandler(async (req, res, next) => {
  const news = await News.findOne({ slug: req.params.slug });

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
