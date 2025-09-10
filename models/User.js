const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: "player" },
  progress: [
    {
      blockNumber: Number,
      attempts: { type: Number, default: 0 },
      solved: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
