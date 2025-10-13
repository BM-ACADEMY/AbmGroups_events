const PatternMarks = require('../models/PatternMarks');
const Participant = require('../models/Participant');
const PatternCompetition = require('../models/PatternCompetition');

// Create participant marks
exports.createMarks = async (req, res) => {
  try {
    const marks = await PatternMarks.create(req.body);
    res.status(201).json({ success: true, data: marks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all marks
exports.getAllMarks = async (req, res) => {
  try {
    const marks = await PatternMarks.find().populate('participant');
    res.status(200).json({ success: true, data: marks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single participant marks
exports.getMarksById = async (req, res) => {
  try {
    const marks = await PatternMarks.findById(req.params.id).populate('participant');
    if (!marks) return res.status(404).json({ success: false, message: 'Marks not found' });
    res.status(200).json({ success: true, data: marks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update participant marks
exports.updateMarks = async (req, res) => {
  try {
    const marks = await PatternMarks.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!marks) return res.status(404).json({ success: false, message: 'Marks not found' });

    // Update Participant total_marks
    const totalScore = (marks.round1_score || 0) + (marks.round2_score || 0) + (marks.round3_score || 0);
    await Participant.findByIdAndUpdate(marks.participant, { total_marks: totalScore });

    res.status(200).json({ success: true, data: marks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete participant marks
exports.deleteMarks = async (req, res) => {
  try {
    const marks = await PatternMarks.findByIdAndDelete(req.params.id);
    if (!marks) return res.status(404).json({ success: false, message: 'Marks not found' });
    res.status(200).json({ success: true, message: 'Marks deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit round answers
exports.submitRound = async (req, res) => {
  try {
    const { participantId, competitionId, round, answers } = req.body;

    // Validate input
    if (!participantId || !competitionId || !round || !answers) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const validRounds = ['round1', 'round2', 'round3'];
    if (!validRounds.includes(round)) {
      return res.status(400).json({ success: false, message: 'Invalid round' });
    }

    // Find participant and marks
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    let marks = await PatternMarks.findOne({ participant: participantId });
    if (!marks) {
      marks = await PatternMarks.create({ participant: participantId });
    }

    // Check if round is already completed
    if (marks.completed_rounds.includes(round)) {
      return res.status(400).json({ success: false, message: `Round ${round} already completed` });
    }

    // Check sequential completion
    if (round === 'round2' && !marks.completed_rounds.includes('round1')) {
      return res.status(400).json({ success: false, message: 'Complete Round 1 before Round 2' });
    }
    if (round === 'round3' && !marks.completed_rounds.includes('round2')) {
      return res.status(400).json({ success: false, message: 'Complete Round 2 before Round 3' });
    }

    // Fetch competition questions
    const competition = await PatternCompetition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    let score = 0;
    const roundMap = {
      round1: 'round1_mcqs',
      round2: 'round2_debugging',
      round3: 'round3_image_notes',
    };
    const roundKey = roundMap[round];

    if (round === 'round1' || round === 'round2') {
      // Calculate score for MCQ or Debugging
      const questions = competition[roundKey];
      answers.forEach((answer) => {
        const question = questions.find((q) => q._id.toString() === answer.questionId);
        if (question && question.correct_answer === answer.selectedOption) {
          score += question.marks;
        }
      });
    } else if (round === 'round3') {
      // Store Answer_note for Round 3
      const newAnswerNotes = answers.map((answer) => ({
        questionId: answer.questionId,
        Answer_note: answer.Answer_note,
      }));
      marks.round3_answer_notes = [...(marks.round3_answer_notes || []), ...newAnswerNotes];
      // Score is initially 0 for Round 3 (to be evaluated later)
      score = 0;
    }

    // Update marks
    marks[`${round}_score`] = score;
    marks.total_score = (marks.round1_score || 0) + (marks.round2_score || 0) + (marks.round3_score || 0);
    if (!marks.completed_rounds.includes(round)) {
      marks.completed_rounds.push(round);
    }

    await marks.save();

    // Update Participant total_marks
    await Participant.findByIdAndUpdate(participantId, { total_marks: marks.total_score });

    res.status(200).json({ success: true, data: marks });
  } catch (error) {
    console.error('Error submitting round:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};