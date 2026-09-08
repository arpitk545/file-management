const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const disclaimerSchema = new mongoose.Schema({
  header: {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  sections: [sectionSchema],
  importantNotice: {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
}, { timestamps: true });

module.exports = mongoose.models.Disclaimer || mongoose.model('Disclaimer', disclaimerSchema);
