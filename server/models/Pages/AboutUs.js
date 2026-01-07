// models/AboutUs.js

const mongoose = require("mongoose");

const ValueSchema = new mongoose.Schema({
  icon: String,
  title: String,
  description: String,
});

const StatSchema = new mongoose.Schema({
  number: String,
  label: String,
});

const TeamMemberSchema = new mongoose.Schema({
  name: String,
  role: String,
  description: String,
  image: { type: String, default: null },
});

const AboutUsSchema = new mongoose.Schema({
  hero: {
    title: String,
    subtitle: String,
    description: String,
  },
  mission: {
    title: String,
    description: String,
  },
  vision: {
    title: String,
    description: String,
  },
  values: [ValueSchema],
  stats: [StatSchema],
  team: [TeamMemberSchema],
}, { timestamps: true });

module.exports = mongoose.model("AboutUs", AboutUsSchema);
