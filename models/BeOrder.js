const mongoose = require("mongoose");

const BeOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
  },

  product_id: {
    type: mongoose.Schema.ObjectId,
    ref: "BeProducts",
  },

  orderType: {
    type: mongoose.Schema.ObjectId,
    ref: "OrderType",
    default: null,
  },

  price: {
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

module.exports = mongoose.model("BeOrder", BeOrderSchema);
