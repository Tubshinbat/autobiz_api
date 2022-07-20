const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Нөхцөл оруулна уу"],
  },

  price: {
    type: Number,
    required: [true, "Үнэ оруулна уу"],
  },

  priceVal: {
    type: String,
    enum: ["₮", "$", "¥", "%"],
    required: [true, "Үнийн төрөл сонгоно уу"],
  },

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Price", PriceSchema);
