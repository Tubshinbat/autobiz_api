const mongoose = require("mongoose");

const HomeCarsSchema = new mongoose.Schema({
  mark_txt: {
    type: String,
    required: [true, "Үйлдвэрлэгч сонгоно уу"],
  },

  type_txt: {
    type: String,
  },

  model: {
    type: String,
    required: [true, "Загвар сонгоно уу"],
  },

  minPrice: {
    type: Number,
    required: [true, "Доод үнэ оруулна уу"],
  },

  maxPrice: {
    type: Number,
    required: [true, "Дээд үнэ оруулна уу"],
  },

  minDate: {
    type: String,
    required: [true, "Доод үйлдвэрлэгдсэн огноо оруулна уу"],
  },

 maxDate: {
    type: String,
    required: [true, "Дээд үйлдвэрлэгдсэн огноо оруулна уу"],
  },

  qty:{
    type:Number,
    required:[true, 'Нийт харуулах тоо'],
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

module.exports = mongoose.model("HomeCars", HomeCarsSchema);
