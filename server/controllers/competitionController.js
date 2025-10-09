// controllers/competitionController.js
const Competition = require("../models/Competition");
const { processFile, deleteFile } = require("../utils/upload");

// ✅ Create Competition
exports.createCompetition = async (req, res) => {
  try {
    const { name, role, is_team_based, requires_upload } = req.body;

    let competition_image = null;
    if (req.file) {
      const mimetype = req.file.mimetype;
      const fileName = `competition_${Date.now()}_${req.file.originalname}`;
      competition_image = await processFile(req.file.buffer, mimetype, 'competition', fileName);
    }

    const competition = new Competition({
      name,
      role,
      is_team_based,
      requires_upload,
      competition_image,
    });

    await competition.save();
    await competition.populate("role", "name");
    res.status(201).json({ message: "Competition created", competition });
  } catch (error) {
    console.error("Error creating competition:", error);
    res.status(500).json({ message: "Error creating competition", error: error.message });
  }
};

// ✅ Get All Competitions
exports.getCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find().populate("role", "name");
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching competitions", error: error.message });
  }
};

// ✅ Get Single Competition
exports.getCompetitionById = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id).populate("role", "name");
    if (!competition) return res.status(404).json({ message: "Competition not found" });
    res.json(competition);
  } catch (error) {
    res.status(500).json({ message: "Error fetching competition", error: error.message });
  }
};

// ✅ Update Competition
exports.updateCompetition = async (req, res) => {
  try {
    const { name, role, is_team_based, requires_upload } = req.body;
    const existingCompetition = await Competition.findById(req.params.id);

    if (!existingCompetition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    let competition_image = existingCompetition.competition_image;
    if (req.file) {
      // Delete old image if exists
      if (existingCompetition.competition_image) {
        deleteFile(existingCompetition.competition_image, 'competition');
      }
      // Process new image
      const mimetype = req.file.mimetype;
      const fileName = `competition_${Date.now()}_${req.file.originalname}`;
      competition_image = await processFile(req.file.buffer, mimetype, 'competition', fileName);
    }

    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        role, 
        is_team_based, 
        requires_upload,
        competition_image 
      },
      { new: true }
    ).populate("role", "name");

    res.json({ message: "Competition updated", competition });
  } catch (error) {
    console.error("Error updating competition:", error);
    res.status(500).json({ message: "Error updating competition", error: error.message });
  }
};

// ✅ Delete Competition
exports.deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    // Delete associated image if exists
    if (competition.competition_image) {
      deleteFile(competition.competition_image, 'competition');
    }

    await Competition.findByIdAndDelete(req.params.id);
    res.json({ message: "Competition deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting competition", error: error.message });
  }
};