const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  cluesSolved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clue' }]
});

module.exports = mongoose.model('Team', teamSchema);
