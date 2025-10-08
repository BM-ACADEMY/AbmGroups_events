// routes/competitionRoutes.js
const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");

// CRUD routes
router.post("/", competitionController.createCompetition);
router.get("/", competitionController.getCompetitions);
router.get("/:id", competitionController.getCompetitionById);
router.put("/:id", competitionController.updateCompetition);
router.delete("/:id", competitionController.deleteCompetition);

module.exports = router;
