const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: Object,
  correctAnswer: String,
  userAnswer: String,
  isCorrect: Boolean,
});

const incorrectAnswerSchema = new mongoose.Schema({
  questionText: String,
  correctAnswer: String,
  userAnswer: String,
});

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  metadata: {
    region: String,
    subject: String,
    examType: String,
    specificClass: String,
    difficulty: String,
    totalQuestions: Number,
    duration: Number,
  },
  timeTaken: Number,
  correctCount: Number,
  questions: [questionSchema],
  incorrectAnswers: [incorrectAnswerSchema],
  createdAt: {
    type: Date,
    default: Date.now, expires: 1200 
  },
});

module.exports = mongoose.model("Result", resultSchema);
