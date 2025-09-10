const mongoose = require("mongoose");

const clueSchema = new mongoose.Schema({
  blockNumber: Number,
  code: String,
  coordinates: String,
  verificationCode: String,        // Add this
  attempts: { type: Number, default: 0 }
});

module.exports = mongoose.model("Clue", clueSchema);
