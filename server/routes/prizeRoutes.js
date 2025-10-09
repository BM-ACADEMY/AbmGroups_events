// routes/prizeRoutes.js
const express = require("express");
const router = express.Router();
const prizeController = require("../controllers/prizeController");

// CRUD routes
router.post("/", prizeController.createPrize);
router.get("/", prizeController.getPrizes);
router.get("/:id", prizeController.getPrizeById);
router.put("/:id", prizeController.updatePrize);
router.delete("/:id", prizeController.deletePrize);

module.exports = router;
