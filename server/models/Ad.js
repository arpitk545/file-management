const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  format: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  slot: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Ad", adSchema);
