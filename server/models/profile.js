const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  fullName: { type: String, required: true },
  mobile: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dob: { type: Date },
  address: { type: String },
  profileImage: { type: String, default: '/placeholder.svg?height=120&width=120' },
  country: { type: String,required: true },

  // System info
  lastLogin: { type: Date },
  timezone: { type: String, default: 'UTC' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
