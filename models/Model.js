const mongoose = require("mongoose");

const ModelSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Моделийн нэрийг оруулна уу"],
    unique: true,
  },
  marka_id: {
    type: String,
  },
  marka_name: {
    type: String,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Model", ModelSchema);
