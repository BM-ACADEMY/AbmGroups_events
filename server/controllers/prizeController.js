// controllers/prizeController.js
const Prize = require("../models/Prize");

// ✅ Create Prize
exports.createPrize = async (req, res) => {
  try {
    const { competition, rank, amount } = req.body;

    const prize = new Prize({ competition, rank, amount });
    await prize.save();

    res.status(201).json({ message: "Prize created", prize });
  } catch (error) {
    res.status(500).json({ message: "Error creating prize", error: error.message });
  }
};

// ✅ Get All Prizes (with competition details)
exports.getPrizes = async (req, res) => {
  try {
    const prizes = await Prize.find().populate("competition", "name");
    res.json(prizes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching prizes", error: error.message });
  }
};

// ✅ Get Single Prize
exports.getPrizeById = async (req, res) => {
  try {
    const prize = await Prize.findById(req.params.id).populate("competition", "name");
    if (!prize) return res.status(404).json({ message: "Prize not found" });
    res.json(prize);
  } catch (error) {
    res.status(500).json({ message: "Error fetching prize", error: error.message });
  }
};

// ✅ Update Prize
exports.updatePrize = async (req, res) => {
  try {
    const { competition, rank, amount } = req.body;

    const prize = await Prize.findByIdAndUpdate(
      req.params.id,
      { competition, rank, amount },
      { new: true }
    ).populate("competition", "name");

    if (!prize) return res.status(404).json({ message: "Prize not found" });

    res.json({ message: "Prize updated", prize });
  } catch (error) {
    res.status(500).json({ message: "Error updating prize", error: error.message });
  }
};

// ✅ Delete Prize
exports.deletePrize = async (req, res) => {
  try {
    const prize = await Prize.findByIdAndDelete(req.params.id);
    if (!prize) return res.status(404).json({ message: "Prize not found" });

    res.json({ message: "Prize deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting prize", error: error.message });
  }
};
