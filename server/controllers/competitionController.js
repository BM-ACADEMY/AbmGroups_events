// controllers/competitionController.js
const Competition = require("../models/Competition");

// ✅ Create Competition
exports.createCompetition = async (req, res) => {
  try {
    const { name, role, is_team_based, requires_upload } = req.body;

    const competition = new Competition({
      name,
      role,
      is_team_based,
      requires_upload,
    });

    await competition.save();
    res.status(201).json({ message: "Competition created", competition });
  } catch (error) {
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

    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      { name, role, is_team_based, requires_upload },
      { new: true }
    );

    if (!competition) return res.status(404).json({ message: "Competition not found" });

    res.json({ message: "Competition updated", competition });
  } catch (error) {
    res.status(500).json({ message: "Error updating competition", error: error.message });
  }
};

// ✅ Delete Competition
exports.deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    res.json({ message: "Competition deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting competition", error: error.message });
  }
};
