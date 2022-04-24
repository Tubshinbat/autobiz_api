const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const BannerSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    minlength: [3, "Баннерын гарчиг хамгийн багадаа 3 дээш тэмдэгтээс бүтнэ."],
    maxlength: [150, "150 -аас дээш тэмдэгт оруулах боломжгүй"],
  },

  details: {
    type: String,
    maxlength: [350, "Баннерын тайлбар 350 - аас дээш оруулах боломжгүй"],
  },

  picture: {
    type: String,
    required: [true, "Зураг оруулна уу"],
  },

  menu: {
    type: mongoose.Schema.ObjectId,
    ref: "Menu",
  },

  model: {
    type: String,
    enum: ["news", "product", "beproduct", "faq"],
  },

  link: {
    type: String,
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

module.exports = mongoose.model("Banner", BannerSchema);
