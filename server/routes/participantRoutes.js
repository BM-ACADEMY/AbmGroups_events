// routes/participantRoutes.js (Updated)
const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");
const { upload } = require("../utils/upload");

// CRUD Routes
router.post("/", upload.single("competition_image"), participantController.createParticipant);
router.get("/", participantController.getParticipants);
router.get("/:id", participantController.getParticipantById);
router.put("/:id", upload.single("competition_image"), participantController.updateParticipant);
router.delete("/:id", participantController.deleteParticipant);

module.exports = router;