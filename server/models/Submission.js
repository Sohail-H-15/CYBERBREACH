const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  questionId: { type: Number, required: true },
  answer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
