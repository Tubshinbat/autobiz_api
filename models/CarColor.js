const mongoose = require("mongoose");

const CarColorSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Өнгөний нэрээ оруулна уу"],
  },

  image: {
    type: String,
  },

  code: {
    type: String,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CarColor", CarColorSchema);
