const mongoose = require("mongoose");

const OrderTypeSchema = new mongoose.Schema({
  name: {
    type: String,
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

module.exports = mongoose.model("OrderType", OrderTypeSchema);
