const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const TermsConditionSchema = new mongoose.Schema({
  header: {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  sections: [SectionSchema],
}, { timestamps: true });

module.exports = mongoose.model('TermsCondition', TermsConditionSchema);
