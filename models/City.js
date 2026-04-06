const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    country_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    latitude: {
      type: String,
      default: "",
    },
    longitude: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

citySchema.index({ state_code: 1, name: 1 });
citySchema.index({ country_code: 1, state_code: 1, name: 1 }, { unique: true });
citySchema.index({ name: "text" });

module.exports = mongoose.model("City", citySchema, "cities");
