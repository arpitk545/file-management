const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subCategory: [subcategorySchema]
});

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: [categorySchema]
});

module.exports = mongoose.model('Region', regionSchema);
