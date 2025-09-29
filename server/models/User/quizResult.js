//this is the models for the admin will create the quiz and user will answer to store the result
const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  score: Number,               
  total: Number,               
  timeTaken: Number,           
  correctAnswers: Number,      
  incorrectAnswers: Number,    
  details: [
    {
      questionId: {type: mongoose.Schema.Types.ObjectId,ref: "Quiz.questions",},
      question: String,
      selected: String,
      correct: String,
      isCorrect: Boolean
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,expires: 1200 
  }
})

module.exports = mongoose.model('UserResult', resultSchema)
