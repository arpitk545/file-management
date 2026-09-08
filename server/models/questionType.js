const mongoose = require("mongoose");
// Region Model

// Subject Schema
const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }
  },
  { _id: false }
);

// Specific Class Schema
const SpecificClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subjects: [SubjectSchema]
  },
  { _id: false }
);

// Exam Type Schema
const ExamTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specificClasses: [SpecificClassSchema]
  },
  { _id: false }
);

// Region Schema
const RegionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    examTypes: [ExamTypeSchema]
  },
  { timestamps: true }
);

const questionTypeRegion = mongoose.model("questionTypeRegion", RegionSchema);
// Q&A Model
const ReportSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true },
    description: { type: String },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportstatus:{type:String,enum:['Pending','Resolved','Rejected'], default:'Pending'},
    reportedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questiontype:{type: String, required: true, default: 'General'},
  questionImage: { type: String },
  answerImage: { type: String },
  questionStatus: { type: String, enum: ['active', 'deactivate'], default: 'deactivate' },
  questionReports: [ReportSchema],
  questionReportStatus: {
    type: String,
    enum: ['reported', 'resolved', 'not reported'],
    default: 'not reported'
  },
  questionReportShow: {
    type: String,
    enum: ['show', 'hide'],
    default: 'show'
  },
  answer: { type: String, required: true },
  answerReports: [ReportSchema],
  answerReportStatus: {
    type: String,
    enum: ['reported', 'resolved', 'not reported'],
    default: 'not reported'
  },
  answerReportShow: {
    type: String,
    enum: ['show', 'hide'],
    default: 'show'
  },

  createdAt: { type: Date, default: Date.now }
});


const qandASchema = new mongoose.Schema({
    category: {
        region: { type: String, required: true }, 
        examType: { type: String, required: true },
        specificClass: { type: String, required: true },
        subject: { type: String, required: true }
    },
    thumbnail: { type: String },
    chapterName: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['active', 'deactivate'], default: 'active' },
    roles: [{ type: String, enum: ['admin', 'manager', 'user'], default: 'user' }],
    questions: [QuestionSchema],
    answer: { type: String,},
    createdAt: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
});

const QandA = mongoose.model("QandA", qandASchema);
const QuestionTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  { timestamps: true }
);

const QuestionType = mongoose.model("QuestionType", QuestionTypeSchema);

module.exports = {
    questionTypeRegion,
    QandA,
    QuestionType,
};
