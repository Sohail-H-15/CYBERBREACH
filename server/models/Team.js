const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  score: { type: Number, default: 0 },
  solvedQuestions: { type: [Number], default: [] },
  lettersCollected: { type: [String], default: [] },
  tabSwitchCount: { type: Number, default: 0 },
  isFinished: { type: Boolean, default: false },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null }
});

module.exports = mongoose.model('Team', teamSchema);
