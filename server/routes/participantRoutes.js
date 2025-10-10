const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");

// CRUD Routes
router.post("/", participantController.createParticipant);
router.get("/", participantController.getParticipants);
router.get("/:id", participantController.getParticipantById);
router.put("/:id", participantController.updateParticipant);
router.delete("/:id", participantController.deleteParticipant);

module.exports = router;
