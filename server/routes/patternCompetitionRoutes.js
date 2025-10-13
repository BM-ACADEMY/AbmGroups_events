const express = require('express');
const router = express.Router();
const patternCompetitionController = require('../controllers/patternCompetitionController');
const { upload } = require('../utils/upload');

router.post('/', patternCompetitionController.createCompetition);
router.get('/', patternCompetitionController.getCompetitions);
router.get('/:id', patternCompetitionController.getCompetitionById);
router.put('/:id', patternCompetitionController.updateCompetition);
router.delete('/:id', patternCompetitionController.deleteCompetition);
router.put('/:id/add-question', upload.single('image'), patternCompetitionController.addQuestion);
router.put('/:id/:round/:questionId', upload.single('image'), patternCompetitionController.updateQuestion);
router.delete('/:id/:round/:questionId', patternCompetitionController.deleteQuestion);

module.exports = router;