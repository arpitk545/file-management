const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  region: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  title: { type: String },
  thumbnail: [{ type: String }], 
  image: [{ type: String }],    
  tags: [{ type: String }],      
  content: { type: String },
  status: { type: String, enum: ['draft', 'approved','rejected'], default: 'draft' },
  commentsEnabled: {
    type: Boolean,
    default: true
  },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
