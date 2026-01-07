// models/index.js or models/contestModels.js

const mongoose = require("mongoose");

// --- Enrollment Schema ---
const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },

  email: { type: String, required: true },
  fullName: { type: String, required: true },
  profileImage: { type: String },

  school: { type: String, required: true },
  class: { type: String, required: true },
  phoneNumber: { type: String, required: true },

  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
  isFirstContest: { type: Boolean, default: true },
}, { timestamps: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);


// --- ContestAttempt Schema ---
const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  selectedOption: {
    type: String,
    enum: ["A", "B", "C", "D", "E"],
  },
}, { _id: false });

const contestAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

contestAttemptSchema.index({ user: 1, contest: 1 }, { unique: true });

const ContestAttempt = mongoose.model("ContestAttempt", contestAttemptSchema);


// --- Export both models ---
module.exports = {
  Enrollment,
  ContestAttempt,
};
