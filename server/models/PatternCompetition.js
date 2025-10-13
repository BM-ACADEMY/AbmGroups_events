const mongoose = require('mongoose');

// Round 1: MCQ
const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  code_snippet: { type: String },
  options: { type: [String], required: true },
  correct_answer: { type: String, required: true },
  marks: { type: Number, default: 1, min: 1 },
});

// Round 2: Debugging
const debuggingSchema = new mongoose.Schema({
  question: { type: String, required: true },
  code_snippet: { type: String },
  options: { type: [String], required: true },
  correct_answer: { type: String, required: true },
  marks: { type: Number, default: 1, min: 1 },
});

// Round 3: Image + Note
const imageNoteSchema = new mongoose.Schema({
  image_url: { type: String, required: true },
  Answer_note: { type: String, required: false }, // Changed to optional
  marks: { type: Number, default: 10, min: 1 },
});

// Main Competition Schema
const patternCompetitionSchema = new mongoose.Schema(
  {
    round1_mcqs: [mcqSchema],
    round2_debugging: [debuggingSchema],
    round3_image_notes: [imageNoteSchema],
    total_round1_marks: { type: Number, default: 0, min: 0 },
    total_round2_marks: { type: Number, default: 0, min: 0 },
    total_round3_marks: { type: Number, default: 0, min: 0 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatternCompetition', patternCompetitionSchema);