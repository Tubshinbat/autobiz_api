const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
  },

  product_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },

  orderType: {
    type: mongoose.Schema.ObjectId,
    ref: "OrderType",
  },

  total: {
    type: Number,
  },

  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  message: { type: [String] },

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
