const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role", // Links to school_student, college_student
      required: true,
    },
    is_team_based: { type: Boolean, default: false },
    requires_upload: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Competition", competitionSchema);
