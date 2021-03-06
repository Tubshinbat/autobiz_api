const mongoose = require("mongoose");

const CarTypeSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Машины төрлийг оруулна уу"],
  },

  image: {
    type: String,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CarType", CarTypeSchema);
