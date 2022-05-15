const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const moment = require("moment-timezone");
const dateUlaanbaatar = moment.tz(Date.now(), "Asia/Ulaanbaatar");

const NewsSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  star: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  slug: String,

  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  details: {
    type: String,
    trim: true,
  },
  shortDetails: {
    type: String,
  },

  type: {
    type: String,
    enum: ["default", "picture", "audio", "video"],
    default: "default",
  },

  pictures: {
    type: [String],
  },

  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "NewsCategory",
    },
  ],

  views: {
    type: Number,
    default: 0,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

NewsSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

NewsSchema.pre("findByIdAndUpdate", function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("News", NewsSchema);
