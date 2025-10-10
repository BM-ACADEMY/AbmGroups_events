const Participant = require('../models/Participant');
const { processFile, deleteFile } = require('../utils/upload');

// Create or update participant
exports.createParticipant = async (req, res) => {
  try {
    const { user, competition, total_marks } = req.body;
    let upload_path = null;

    if (req.file) {
      if (req.file.size > 20 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'File size must be less than 20MB' });
      }

      const mimetype = req.file.mimetype;
      const fileName = `drawingevent_${Date.now()}_${req.file.originalname}`;
      upload_path = await processFile(req.file.buffer, mimetype, 'drawingevent', fileName);
    }

    const existingParticipant = await Participant.findOne({ user });

    if (existingParticipant) {
      if (existingParticipant.upload_path && req.file) {
        deleteFile(existingParticipant.upload_path, 'drawingevent');
      }

      const updatedParticipant = await Participant.findByIdAndUpdate(
        existingParticipant._id,
        {
          competition,
          upload_path: upload_path || existingParticipant.upload_path,
          total_marks: total_marks !== undefined ? total_marks : existingParticipant.total_marks,
        },
        { new: true }
      )
        .populate('user', 'name email phone')
        .populate('competition', 'name is_team_based requires_upload');

      return res.json({ success: true, data: updatedParticipant });
    } else {
      const participant = new Participant({
        user,
        competition,
        upload_path,
        total_marks,
      });

      await participant.save();
      const populatedParticipant = await Participant.findById(participant._id)
        .populate('user', 'name email phone')
        .populate('competition', 'name is_team_based requires_upload');

      res.status(201).json({ success: true, data: populatedParticipant });
    }
  } catch (err) {
    console.error('Error in createParticipant:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'User already has a participant entry' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateParticipant = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      if (req.file.size > 20 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'File size must be less than 20MB' });
      }

      const existingParticipant = await Participant.findById(req.params.id);
      if (!existingParticipant) {
        return res.status(404).json({ success: false, message: 'Participant not found' });
      }

      if (existingParticipant.upload_path) {
        deleteFile(existingParticipant.upload_path, 'drawingevent');
      }

      const mimetype = req.file.mimetype;
      const fileName = `drawingevent_${Date.now()}_${req.file.originalname}`;
      updateData.upload_path = await processFile(req.file.buffer, mimetype, 'drawingevent', fileName);
    }

    const participant = await Participant.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('user', 'name email phone')
      .populate('competition', 'name is_team_based requires_upload');

    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }
    res.json({ success: true, data: participant });
  } catch (err) {
    console.error('Error in updateParticipant:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all participants
exports.getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find()
      .populate('user', 'name email phone')
      .populate('competition', 'name is_team_based requires_upload');
    res.json({ success: true, data: participants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single participant
exports.getParticipantById = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('competition', 'name');
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
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
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }
    if (participant.upload_path) {
      deleteFile(participant.upload_path, 'drawingevent');
    }
    res.json({ success: true, message: 'Participant deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};