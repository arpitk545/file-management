// const mongoose = require('mongoose');

// const CommentSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   userProfile: {
//     name: String,
//     avatar: String,
//     initials: String,
//     email:String,
//   },
//   title:{
//    type:String,

//   },
//   content: {
//     type: String,
//     required: true
//   },
//   rating: {
//     type: Number,
//     default: 5
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending'
//   },
//   category: {
//     type: String,
//     enum: ['Article', 'File', 'Quiz', 'Contest','AIQuiz'],
//     required: true
//   },
//   refId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Comment', CommentSchema);
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
  },
  content: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: ['Article', 'File', 'Quiz', 'Contest', 'AIQuiz'],
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
