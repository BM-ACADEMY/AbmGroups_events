// patternMarksRoutes.js
const express = require('express');
const router = express.Router();
const patternMarksController = require('../controllers/patternMarksController');

// CRUD Routes
router.post('/', patternMarksController.createMarks);
router.get('/', patternMarksController.getAllMarks);
router.get('/:id', patternMarksController.getMarksById);
router.put('/:id', patternMarksController.updateMarks);
router.delete('/:id', patternMarksController.deleteMarks);
router.post('/submit-round', patternMarksController.submitRound);
router.get('/participant/:participantId', patternMarksController.getMarksByParticipant);
router.post('/update-round3', patternMarksController.updateRound3Marks);

module.exports = router;