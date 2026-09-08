const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  topic: String,
  questionType: String,
  image: String,
  question: String,
  options: {
    type: [String],
    validate: [opt => opt.length >= 4 && opt.length <= 5, '4 or 5 options are required']
  },
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D", "E"]
  }
}, { _id: false });

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description:{type:String,required:true},
  thumbnail:String,
  status: {
    type: String,
    enum: ["Approved", "Waiting for Approval", "Rejected Contest", "Rejected"],
    default: "Approved",
  },
  passcode:{type:String},
  region: String,
  examType: String,
  specificClass: String,
  subject: String,
  chapter: String,
  prize: String,
  deadline: Date,
  startTime:Date,
  duration:Number,
  author:String,
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model("Contest", contestSchema);
