const mongoose = require("mongoose");

const BeOrderSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  lastname: {
    type: String,
  },

  phone: {
    type: String,
  },

  email: {
    type: String,
  },

  product_id: {
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

  message: { type: [String] },

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

module.exports = mongoose.model("BeOrder", BeOrderSchema);
