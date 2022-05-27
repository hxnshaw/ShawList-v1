const mongoose = require("mongoose");
const validator = require("validator");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: "string",
      required: true,
      trim: true,
    },
    description: {
      type: "string",
      required: true,
      trim: true,
      maxlength: 250,
    },
    price: {
      type: Number,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
      required: true,
    },
    image: {
      type: Buffer,
    },
    sold: {
      type: Boolean,
      default: false,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
  {
    toJSON: { getters: true }, //this right here
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
