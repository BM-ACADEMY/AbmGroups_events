// models/Participant.js
const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competition",
    required: true,
  },
  upload_path: [
    {
      type: String,
      default: null,
    },
  ],
  total_marks: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Participant", participantSchema);