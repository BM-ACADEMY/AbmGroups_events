const PatternCompetition = require('../models/PatternCompetition');
const { processFile, deleteFile } = require('../utils/upload');

exports.createCompetition = async (req, res) => {
  try {
    const competition = await PatternCompetition.create(req.body);
    res.status(201).json({ success: true, data: competition });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCompetitions = async (req, res) => {
  try {
    const competitions = await PatternCompetition.find().populate('created_by', 'name email');
    res.status(200).json({ success: true, data: competitions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompetitionById = async (req, res) => {
  try {
    const competition = await PatternCompetition.findById(req.params.id).populate('created_by', 'name email');
    if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });
    res.status(200).json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCompetition = async (req, res) => {
  try {
    const competition = await PatternCompetition.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });
    res.status(200).json({ success: true, data: competition });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCompetition = async (req, res) => {
  try {
    const competition = await PatternCompetition.findByIdAndDelete(req.params.id);
    if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });
    res.status(200).json({ success: true, message: 'Competition deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { round, questionData: questionDataRaw, Answer_note, marks } = req.body;
    let questionData;

    const competition = await PatternCompetition.findById(id);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    if (round === 'round1' || round === 'round2') {
      questionData = JSON.parse(questionDataRaw);
      if (!questionData.question || !questionData.options || !questionData.correct_answer || !questionData.marks) {
        return res.status(400).json({ success: false, message: 'Missing required fields for question' });
      }
      if (!questionData.options.includes(questionData.correct_answer)) {
        return res.status(400).json({ success: false, message: 'Correct answer must be one of the options' });
      }
      if (questionData.marks < 1) {
        return res.status(400).json({ success: false, message: 'Marks must be at least 1' });
      }
      if (round === 'round1') {
        if (competition.round1_mcqs.length >= 5) {
          return res.status(400).json({ success: false, message: 'Maximum 5 questions allowed for Round 1' });
        }
        competition.round1_mcqs.push(questionData);
        competition.total_round1_marks += parseInt(questionData.marks);
      } else {
        if (competition.round2_debugging.length >= 5) {
          return res.status(400).json({ success: false, message: 'Maximum 5 questions allowed for Round 2' });
        }
        competition.round2_debugging.push(questionData);
        competition.total_round2_marks += parseInt(questionData.marks);
      }
    } else if (round === 'round3') {
      if (!req.file || !marks) {
        return res.status(400).json({ success: false, message: 'Image and marks are required for round3' });
      }
      if (competition.round3_image_notes.length >= 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 questions allowed for Round 3' });
      }
      const imagePath = await processFile(req.file.buffer, req.file.mimetype, 'competition_images', req.file.originalname);
      questionData = {
        image_url: imagePath,
        Answer_note: Answer_note || undefined, // Allow optional Answer_note
        marks: parseInt(marks),
      };
      if (questionData.marks < 1) {
        return res.status(400).json({ success: false, message: 'Marks must be at least 1' });
      }
      competition.round3_image_notes.push(questionData);
      competition.total_round3_marks += parseInt(questionData.marks);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid round specified' });
    }

    await competition.save();
    res.status(200).json({ success: true, data: competition });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id, round, questionId } = req.params;
    const competition = await PatternCompetition.findById(id);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    const roundMap = {
      round1: 'round1_mcqs',
      round2: 'round2_debugging',
      round3: 'round3_image_notes',
    };
    const roundKey = roundMap[round];
    if (!roundKey) {
      return res.status(400).json({ success: false, message: 'Invalid round specified' });
    }

    const question = competition[roundKey].id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    let questionData;
    if (round === 'round3') {
      const { Answer_note, marks } = req.body;
      if (!req.file && !question.image_url) {
        return res.status(400).json({ success: false, message: 'Image is required for round3' });
      }
      if (!marks) {
        return res.status(400).json({ success: false, message: 'Marks are required for round3' });
      }
      const imagePath = req.file ? await processFile(req.file.buffer, req.file.mimetype, 'competition_images', req.file.originalname) : question.image_url;
      questionData = {
        image_url: imagePath,
        Answer_note: Answer_note || undefined, // Allow optional Answer_note
        marks: parseInt(marks),
      };
      if (questionData.marks < 1) {
        return res.status(400).json({ success: false, message: 'Marks must be at least 1' });
      }
    } else {
      questionData = JSON.parse(req.body.questionData);
      if (!questionData.question || !questionData.options || !questionData.correct_answer || !questionData.marks) {
        return res.status(400).json({ success: false, message: 'Missing required fields for question' });
      }
      if (!questionData.options.includes(questionData.correct_answer)) {
        return res.status(400).json({ success: false, message: 'Correct answer must be one of the options' });
      }
      if (questionData.marks < 1) {
        return res.status(400).json({ success: false, message: 'Marks must be at least 1' });
      }
    }

    // Update total marks
    const oldMarks = question.marks;
    competition[`total_${round}_marks`] = Math.max(0, competition[`total_${round}_marks`] - oldMarks + parseInt(questionData.marks));

    // Update question
    competition[roundKey].id(questionId).set(questionData);
    await competition.save();

    res.status(200).json({ success: true, data: competition });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id, round, questionId } = req.params;
    const competition = await PatternCompetition.findById(id);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    const roundMap = {
      round1: 'round1_mcqs',
      round2: 'round2_debugging',
      round3: 'round3_image_notes',
    };
    const roundKey = roundMap[round];
    if (!roundKey) {
      return res.status(400).json({ success: false, message: 'Invalid round specified' });
    }

    const question = competition[roundKey].id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const questionMarks = parseInt(question.marks);
    if (isNaN(questionMarks) || questionMarks < 0) {
      return res.status(400).json({ success: false, message: 'Invalid marks value' });
    }

    // Delete image file for Round 3
    if (round === 'round3' && question.image_url) {
      deleteFile(question.image_url, 'competition_images');
    }

    competition[roundKey].pull({ _id: questionId });
    competition[`total_${round}_marks`] = Math.max(0, competition[`total_${round}_marks`] - questionMarks);

    await competition.save();
    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};