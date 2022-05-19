const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  title: {
    type: String,
  },

  type: {
    type: String,
    enum: ["beproduct", "product"],
  },

  product_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },

  beproduct_id: {
    type: mongoose.Schema.ObjectId,
    ref: "BeProducts",
  },

  done: {
    type: Boolean,
    default: false,
  },

  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  message: [
    { message: { type: String } },
    { subject: { type: String } },
    { createAt: { type: Date } },
    { userName: { type: String } },
  ],

  invoice: {
    type: mongoose.Schema.ObjectId,
    ref: "Invoice",
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

module.exports = mongoose.model("Order", OrderSchema);
