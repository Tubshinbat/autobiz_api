const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },
  id: {
    type: String,
  },
  product_id: {
    type: String,
  },
  phone: {
    type: Number,
    required: [true, "Утасны дугаараа заавал оруулна уу"],
  },
  email: {
    type: String,
    trim: true,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      "Имэйл хаягаа буруу оруулсан байна",
    ],
  },

  time: {
    type: Date,
  },
  address: {
    type: String,
  },
  active: {
    type: String,
  },
  done: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  bid_done: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  checked: {
    type: String,
  },
  count_bid: {
    type: String,
  },
  comment: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  price: {
    type: Number,
  },

  START: {
    type: String,
  },
  FINISH: {
    type: String,
  },
  MARKA_NAME: {
    type: String,
  },
  MODEL_NAME: {
    type: String,
  },
  YEAR: {
    type: String,
  },

  KPP: {
    type: String,
  },

  MILEAGE: {
    type: String,
  },
  ENG_V: {
    type: String,
  },

  KUZOV: {
    type: String,
  },

  RATE: {
    type: String,
  },

  AUCTION_DATE: {
    type: String,
  },

  AUCTION: {
    type: String,
  },

  GRADE: {
    type: String,
  },

  LOT: {
    type: String,
  },

  door: {
    type: String,
  },

  AC: {
    type: String,
  },

  fuel: {
    type: String,
  },
  leave_place: {
    type: String,
  },
  arrival: {
    type: String,
  },
  arrival_date: {
    type: String,
  },
  arrival_port: {
    type: String,
  },

  ship_company: {
    type: String,
  },
  ship_name: {
    type: String,
  },
  voyage: {
    type: String,
  },
  ship_date: {
    type: String,
  },
  bl_no: {
    type: String,
  },
  sale_price: {
    type: String,
  },
  inyard_date: {
    type: String,
  },
  yard_fee: {
    type: String,
  },
  days: {
    type: String,
  },
  payment: {
    type: String,
  },
  container: {
    type: String,
  },
  seat: {
    type: String,
  },
  export_cert_eng: {
    type: String,
  },
  export_cert_jpn: {
    type: String,
  },
  BL_original: {
    type: String,
  },
  blno: {
    type: String,
  },
  invoice: {
    type: String,
  },
  insurance: {
    type: String,
  },
  inspection: {
    type: String,
  },
  ship: {
    type: String,
  },
  JAAI: {
    type: String,
  },
  FOB: {
    type: String,
  },
  courier: {
    type: String,
  },
  date: {
    type: String,
  },
  tracking_no: {
    type: String,
  },
  IMAGES: {
    type: String,
  },
  plus_images: {
    type: [String],
  },

  create_at: {
    type: Date,
    default: Date.now,
  },
  update_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
