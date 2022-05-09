const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const ProductSchema = new mongoose.Schema({
  id: {
    type: String,
    default: null,
  },

  car_industry: {
    type: mongoose.Schema.ObjectId,
    ref: "carIndustry",
    default: null,
  },

  car_zagvar: {
    type: mongoose.Schema.ObjectId,
    ref: "CarZagar",
    default: null,
  },

  car_type: {
    type: mongoose.Schema.ObjectId,
    ref: "CarType",
    default: null,
  },

  active: {
    type: Number,
  },

  title: {
    type: String,
  },

  pictures: {
    type: [String],
  },
  description: {
    type: String,
    default: null,
  },
  price: {
    type: mongoose.Decimal128,
    default: null,
  },

  make_date: {
    type: Number,
  },
  import_date: {
    type: Number,
  },

  car_motor: {
    type: Number,
  },

  car_km: {
    type: Number,
  },

  color: {
    type: mongoose.Schema.ObjectId,
    ref: "CarColor",
    default: null,
  },

  car_hurd: {
    type: String,
    enum: ["Зөв", "Буруу", "Бусад"],
    default: "Буруу",
  },

  car_shatakhuun: {
    type: String,
  },
  car_speed_box: {
    type: String,
  },
  lizing: {
    type: String,
  },

  phone: {
    type: Number,
  },
  email: {
    type: String,
    trim: true,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      "Имэйл хаягаа буруу оруулсан байна",
    ],
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

module.exports = mongoose.model("Product", ProductSchema);
