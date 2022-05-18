const mongoose = require("mongoose");

const BeProductsSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  sold: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  id: {
    type: String,
  },
  title: {
    type: String,
    default: null,
  },

  mark_txt: {
    type: String,
    default: null,
  },

  type_txt: {
    type: String,
    default: null,
  },

  price: {
    type: Number,
    default: null,
  },
  model_ref: {
    type: String,
    default: null,
  },

  model: {
    type: String,
    default: null,
  },

  country: {
    type: String,
    default: null,
  },

  location_fob: {
    type: String,
    default: null,
  },

  mileage: {
    type: Number,
    default: null,
  },

  car_year: {
    type: Number,
    default: null,
  },

  mount: {
    type: Number,
    default: null,
  },

  engine: {
    type: Number,
    default: null,
  },

  trans: {
    type: String,
    default: null,
  },

  fuel: {
    type: String,
    default: null,
  },

  features: {
    type: [String],
    default: null,
  },

  gallery_images: {
    type: [String],
    default: null,
  },

  new_images: {
    type: [String],
    default: null,
  },

  href: {
    type: String,
    default: null,
  },

  is_load: {
    type: Number,
    default: 0,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BeProducts", BeProductsSchema);
