const mongoose = require("mongoose");

const HybridSchema = new mongoose.Schema({
  model: {
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
});

module.exports = mongoose.model("Hybrid", HybridSchema);
