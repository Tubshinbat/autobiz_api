const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const FooterMenuSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  isDirect: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  isModel: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    required: [true, "Цэсний нэрээ оруулна уу"],
    trim: true,
  },

  direct: {
    type: String,
  },

  slug: {
    type: String,
  },

  parentId: {
    type: String,
  },

  model: {
    type: String,
    enum: ["news", "products", "beproducts", "faq", "lend", "calculator"],
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

FooterMenuSchema.pre("save", function (next) {
  const date = Date.now();
  this.slug = slugify(this.name) + date;
  next();
});

module.exports = mongoose.model("FooterMenu", FooterMenuSchema);
