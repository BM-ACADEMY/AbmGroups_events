const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // school_student, college_student, admin
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
