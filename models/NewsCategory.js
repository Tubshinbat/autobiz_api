const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const NewsCategorySchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    required: [true, "Төлөв сонгоно уу"],
    default: true,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Ангилалын нэрийг оруулна уу"],
  },

  slug: {
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
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

NewsCategorySchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

NewsCategorySchema.pre("updateOne", function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("NewsCategory", NewsCategorySchema);
