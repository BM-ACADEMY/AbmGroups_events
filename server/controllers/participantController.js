const Participant = require('../models/Participant');
const { processFile, deleteFile } = require('../utils/upload');

// Create or update participant
exports.createParticipant = async (req, res) => {
  try {
    const { user, competition, total_marks } = req.body;
    let upload_path = [];

    // Fetch competition details to determine max uploads
    const competitionDoc = await require('../models/Competition').findById(competition);
    if (!competitionDoc) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }
    const maxUploads = competitionDoc.name.toLowerCase().includes('photography') ? 15 : 3;

    if (req.files && req.files.length > 0) {
      // Validate file size (20MB limit per file)
      for (const file of req.files) {
        if (file.size > 20 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: `File ${file.originalname} exceeds 20MB limit` });
        }
      }

      // Validate total file count
      if (req.files.length > maxUploads) {
        return res.status(400).json({ success: false, message: `Cannot upload more than ${maxUploads} files for this competition.` });
      }

      // Process each file
      upload_path = await Promise.all(
        req.files.map(async (file) => {
          const fileName = `drawingevent_${Date.now()}_${file.originalname}`;
          return await processFile(file.buffer, file.mimetype, 'drawingevent', fileName);
        })
      );
    }

    const existingParticipant = await Participant.findOne({ user });

    if (existingParticipant) {
      // Delete existing files if new files are uploaded
      if (existingParticipant.upload_path && req.files && req.files.length > 0) {
        for (const path of existingParticipant.upload_path) {
          deleteFile(path, 'drawingevent');
        }
      }

      const updatedParticipant = await Participant.findByIdAndUpdate(
        existingParticipant._id,
        {
          competition,
          upload_path: upload_path.length > 0 ? upload_path : existingParticipant.upload_path,
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

// Update participant
exports.updateParticipant = async (req, res) => {
  try {
    let updateData = { ...req.body };
    let upload_path = [];

    const existingParticipant = await Participant.findById(req.params.id);
    if (!existingParticipant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    // Fetch competition details to determine max uploads
    const competitionDoc = await require('../models/Competition').findById(existingParticipant.competition);
    if (!competitionDoc) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }
    const maxUploads = competitionDoc.name.toLowerCase().includes('photography') ? 15 : 3;

    if (req.files && req.files.length > 0) {
      // Validate file size (20MB limit per file)
      for (const file of req.files) {
        if (file.size > 20 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: `File ${file.originalname} exceeds 20MB limit` });
        }
      }

      // Validate total file count (existing + new <= maxUploads)
      const existingFileCount = Array.isArray(existingParticipant.upload_path) ? existingParticipant.upload_path.length : 0;
      const newFileCount = req.files.length;
      if (existingFileCount + newFileCount > maxUploads) {
        return res.status(400).json({ success: false, message: `Cannot upload more than ${maxUploads} files. You already have ${existingFileCount} file(s).` });
      }

      // Process new files
      upload_path = await Promise.all(
        req.files.map(async (file) => {
          const fileName = `drawingevent_${Date.now()}_${file.originalname}`;
          return await processFile(file.buffer, file.mimetype, 'drawingevent', fileName);
        })
      );

      // Append new file paths to existing ones
      updateData.upload_path = [...(existingParticipant.upload_path || []), ...upload_path];
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
      for (const path of participant.upload_path) {
        deleteFile(path, 'drawingevent');
      }
    }
    res.json({ success: true, message: 'Participant deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};