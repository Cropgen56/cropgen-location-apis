const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    state_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    country_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

stateSchema.index({ country_code: 1, name: 1 });
stateSchema.index({ country_code: 1, state_code: 1 }, { unique: true });

module.exports = mongoose.model("State", stateSchema, "states");
