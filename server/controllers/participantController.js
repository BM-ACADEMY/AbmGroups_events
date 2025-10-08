const Participant = require("../models/Participant");

// Create participant (update if existing for user)
exports.createParticipant = async (req, res) => {
  try {
    const { user, competition, upload_path, total_marks } = req.body;

    const existingParticipant = await Participant.findOne({ user });

    if (existingParticipant) {
      // Update existing participant's competition and other fields
      const updatedParticipant = await Participant.findByIdAndUpdate(
        existingParticipant._id,
        {
          competition,
          upload_path: upload_path !== undefined ? upload_path : existingParticipant.upload_path,
          total_marks: total_marks !== undefined ? total_marks : existingParticipant.total_marks,
        },
        { new: true }
      ).populate("user", "name email phone")
       .populate("competition", "name is_team_based requires_upload");

      return res.json({ success: true, data: updatedParticipant });
    } else {
      // Create new participant
      const participant = new Participant({
        user,
        competition,
        upload_path,
        total_marks,
      });

      await participant.save();
      const populatedParticipant = await Participant.findById(participant._id)
        .populate("user", "name email phone")
        .populate("competition", "name is_team_based requires_upload");

      res.status(201).json({ success: true, data: populatedParticipant });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "User already has a participant entry" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all participants
exports.getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find()
      .populate("user", "name email phone")
      .populate("competition", "name is_team_based requires_upload");
    res.json({ success: true, data: participants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single participant
exports.getParticipantById = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("competition", "name");
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }
    res.json({ success: true, data: participant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update participant
exports.updateParticipant = async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("user", "name email phone")
     .populate("competition", "name is_team_based requires_upload");
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }
    res.json({ success: true, data: participant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete participant
exports.deleteParticipant = async (req, res) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }
    res.json({ success: true, message: "Participant deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};