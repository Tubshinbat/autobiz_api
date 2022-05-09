const mongoose = require("mongoose");

const CarIndustrySchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Машины үйлдвэрлэгчийн нэрийг оруулна уу"],
  },

  image: {
    type: String,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CarIndustry", CarIndustrySchema);
