const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
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
    upload_path: {
      type: String,
    },
    total_marks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Ensure only one participant per user
participantSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("Participant", participantSchema);