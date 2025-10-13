const express = require('express');
const router = express.Router();
const patternSubmissionController = require('../controllers/patternSubmissionController');

router.post('/submit-round', patternSubmissionController.submitRound);

module.exports = router;