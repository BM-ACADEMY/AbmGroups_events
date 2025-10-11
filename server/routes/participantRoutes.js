const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");
const { upload } = require("../utils/upload");

// CRUD Routes
router.post("/", upload.array("competition_image", 15), participantController.createParticipant);
router.get("/", participantController.getParticipants);
router.get("/:id", participantController.getParticipantById);
router.put("/:id", upload.array("competition_image", 15), participantController.updateParticipant);
router.delete("/:id", participantController.deleteParticipant);

module.exports = router;