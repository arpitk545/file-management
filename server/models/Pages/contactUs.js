const mongoose = require("mongoose");

const ContactDetailSchema = new mongoose.Schema({
  icon: String,
  title: String,
  info: String,
  description: String,
});

const CategorySchema = new mongoose.Schema({
  value: String,
  label: String,
  icon: String,
});

const HeroSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
});

const ContactUsSchema = new mongoose.Schema({
  hero: HeroSchema,
  contactDetails: [ContactDetailSchema],
  categories: [CategorySchema],
}, { timestamps: true });

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
)
const ContactUs = mongoose.model("ContactUs", ContactUsSchema);
const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
module.exports = {
  ContactUs,
  ContactMessage,
};
