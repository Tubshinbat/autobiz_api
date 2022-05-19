const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  fields: [{ name: String }, { field: Number }],

  total: {
    type: Number,
  },

  rateType: {
    type: String,
  },

  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },

  beproduct: {
    type: mongoose.Schema.ObjectId,
    ref: "BeProducts",
  },

  bankName: {
    type: String,
  },

  bankAddress: {
    type: String,
  },

  pdf: {
    type: String,
  },

  message: {
    type: String,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
