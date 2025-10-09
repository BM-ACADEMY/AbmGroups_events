// routes/competitionRoutes.js
const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");
const { upload } = require("../utils/upload");

// CRUD routes with multer for file upload
router.post("/", upload.single("competition_image"), competitionController.createCompetition);
router.get("/", competitionController.getCompetitions);
router.get("/:id", competitionController.getCompetitionById);
router.put("/:id", upload.single("competition_image"), competitionController.updateCompetition);
router.delete("/:id", competitionController.deleteCompetition);

module.exports = router;