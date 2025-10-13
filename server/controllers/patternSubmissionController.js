const PatternCompetition = require('../models/PatternCompetition');
const PatternMarks = require('../models/PatternMarks');
const Participant = require('../models/Participant');

exports.submitRound = async (req, res) => {
  try {
    const { participantId, competitionId, round, answers } = req.body;

    if (!participantId || !competitionId || !round || !answers) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const competition = await PatternCompetition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    let marks = await PatternMarks.findOne({ participant: participantId });
    if (!marks) {
      marks = await PatternMarks.create({
        participant: participantId,
        round1_score: 0,
        round2_score: 0,
        round3_score: 0,
        total_score: 0,
        completed_rounds: [],
      });
    }

    let score = 0;
    let roundKey;
    let updateField;

    if (round === 'round1') {
      roundKey = 'round1_mcqs';
      updateField = 'round1_score';
      if (marks.completed_rounds.includes('round1')) {
        return res.status(400).json({ success: false, message: 'Round 1 already completed' });
      }
      answers.forEach((answer) => {
        const question = competition.round1_mcqs.find((q) => q._id.toString() === answer.questionId);
        if (question && answer.selectedOption === question.correct_answer) {
          score += question.marks;
        }
      });
      marks.completed_rounds.push('round1');
    } else if (round === 'round2') {
      roundKey = 'round2_debugging';
      updateField = 'round2_score';
      if (!marks.completed_rounds.includes('round1')) {
        return res.status(400).json({ success: false, message: 'Complete Round 1 first' });
      }
      if (marks.completed_rounds.includes('round2')) {
        return res.status(400).json({ success: false, message: 'Round 2 already completed' });
      }
      answers.forEach((answer) => {
        const question = competition.round2_debugging.find((q) => q._id.toString() === answer.questionId);
        if (question && answer.selectedOption === question.correct_answer) {
          score += question.marks;
        }
      });
      marks.completed_rounds.push('round2');
    } else if (round === 'round3') {
      roundKey = 'round3_image_notes';
      updateField = 'round3_score';
      if (!marks.completed_rounds.includes('round2')) {
        return res.status(400).json({ success: false, message: 'Complete Round 2 first' });
      }
      if (marks.completed_rounds.includes('round3')) {
        return res.status(400).json({ success: false, message: 'Round 3 already completed' });
      }
      answers.forEach((answer) => {
        const question = competition.round3_image_notes.find((q) => q._id.toString() === answer.questionId);
        if (question) {
          question.Answer_note = answer.Answer_note;
          score += question.marks; // Assign full marks (adjust for manual evaluation if needed)
        }
      });
      marks.completed_rounds.push('round3');
    } else {
      return res.status(400).json({ success: false, message: 'Invalid round specified' });
    }

    // Update PatternMarks
    marks[updateField] = score;
    marks.total_score = marks.round1_score + marks.round2_score + marks.round3_score;
    await marks.save();

    // Sync with Participant
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }
    participant.total_marks = marks.total_score;
    await participant.save();

    res.status(200).json({
      success: true,
      data: { score, total_score: marks.total_score, completed_rounds: marks.completed_rounds },
    });
  } catch (error) {
    console.error('Error submitting round:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};