const mongoose = require("mongoose");

// // Subschemas
// const ChapterSchema = new mongoose.Schema({
//   name: { type: String, required: true },
// }, { _id: false });

// const SubjectSchema = new mongoose.Schema({
//   name: { type: String, required: true },
// }, { _id: false });

// const SpecificClassSchema = new mongoose.Schema({
//   name: { type: String, required: true },
// }, { _id: false });

// const ExamTypeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
// }, { _id: false });

// // Main Region schema
// const RegionSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   examTypes: [ExamTypeSchema],
//   specificClasses: [SpecificClassSchema],
//   subjects: [SubjectSchema],
//   chapters: [ChapterSchema],
// }, { timestamps: true });
const ChapterSchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { _id: false });

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  chapters: [ChapterSchema]
}, { _id: false });

const SpecificClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjects: [SubjectSchema]
}, { _id: false });

const ExamTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specificClasses: [SpecificClassSchema]
}, { _id: false });

const RegionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  examTypes: [ExamTypeSchema]
}, { timestamps: true });

//for create quiz questions
const QuestionSubSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: String,
  note:String,
  reports: [
  {
    description: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }
  ],
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
  },
  correctAnswer: { type: String, enum: ["A", "B", "C", "D"], required: true },
  difficulty: { type: String, enum: ["Easy", "Average", "Hard"], required: true },
  tags: [String],
});

const QuestionSchema = new mongoose.Schema({
   category: {
    quizTitle:{type:String},
    description:{type:String},
    thumbnailimage:{type:String},
    languages:{type:String},
    duration:{type:Number},
    author:{type:String},
    approvalStatus: {
    type: String,
    enum: ['Waiting for Approval', 'Approved', 'Rejected'],
    default: 'Approved',
    },
    totalQuestions: { type: Number, default: 5 },
    region: { type: String, required: true},
    examType: { type: String, required: true },
    specificClass: { type: String, required: true },
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    quizType:{type:String},
    passcode:{type:String},
  },
  questions: [QuestionSubSchema],
}, { timestamps: true });
const QuizRegion = mongoose.model("QuizRegion", RegionSchema);
const Quiz = mongoose.model("Quiz", QuestionSchema);

module.exports = {
  QuizRegion,
  Quiz,
};

