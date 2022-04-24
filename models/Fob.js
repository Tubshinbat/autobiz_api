const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const FobSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  auction_name: {
    type: String,
    required: [true, "Fob - ийн нэрийг оруулна уу"],
  },
  fob_price: {
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

module.exports = mongoose.model("Fob", FobSchema);
