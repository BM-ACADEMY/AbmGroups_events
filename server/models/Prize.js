// models/Prize.js
const mongoose = require("mongoose");

const prizeSchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    rank: { type: String, required: true }, // e.g., "1st", "2nd", "Top 10"
    amount: { type: mongoose.Decimal128, required: true }, // stores precise decimal
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prize", prizeSchema);
