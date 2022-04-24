const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const PageSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  listActive: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    required: [true, "Хуудасны нэрийг оруулна уу"],
  },

  pageInfo: {
    type: String,
    required: [true, "Хуудасны дэлгэрэнгүй мэдээллийг оруулна уу"],
  },

  menu: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Menu",
    },
  ],

  footerMenu: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "FooterMenu",
    },
  ],

  pictures: {
    type: [String],
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

module.exports = mongoose.model("Page", PageSchema);
