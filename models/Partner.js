const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Хамтрагч компанийн нэрийг оруулна уу"],
  },

  link: {
    type: String,
  },

  logo: {
    type: String,
    required: [true, "Лого оруулна уу"],
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Partner", PartnerSchema);
