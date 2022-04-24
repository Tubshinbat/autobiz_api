const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const MenuSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
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
  },

  direct: {
    type: String,
  },

  picture: {
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
    enum: ["news", "product", "beproduct", "faq"],
  },

  position: {
    type: Number,
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

MenuSchema.pre("save", function (next) {
  const date = Date.now();
  this.slug = slugify(this.name) + date;
  next();
});

module.exports = mongoose.model("Menu", MenuSchema);
