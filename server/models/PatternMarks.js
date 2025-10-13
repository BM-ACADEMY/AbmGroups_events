const mongoose = require('mongoose');

const patternMarksSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
    round1_score: { type: Number, default: 0 },
    round2_score: { type: Number, default: 0 },
    round3_score: { type: Number, default: 0 },
    total_score: { type: Number, default: 0 },
    round3_answer_notes: [{ // Store Round 3 answers
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      Answer_note: { type: String, required: false },
    }],
    completed_rounds: {
      type: [String], // ['round1', 'round2', 'round3']
      default: [],
    },
    evaluated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatternMarks', patternMarksSchema);