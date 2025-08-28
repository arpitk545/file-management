const {ContactMessage,ContactUs} = require("../../models/Pages/contactUs")

exports.getContactUs = async (req, res) => {
  try {
    const contactUs = await ContactUs.findOne();
    if (!contactUs) return res.status(404).json({ message: "Contact Us data not found" });
    res.json(contactUs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create Contact Us data (only if it doesn't exist)
exports.createContactUs = async (req, res) => {
  try {
    const existing = await ContactUs.findOne();
    if (existing) return res.status(400).json({ message: "Contact Us data already exists" });

    const contactData = req.body;

    const newContact = new ContactUs(contactData);
    await newContact.save();

    res.status(201).json(newContact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Contact Us data
exports.updateContactUs = async (req, res) => {
  try {
    const contactData = req.body;

    const updated = await ContactUs.findOneAndUpdate({}, contactData, {
      new: true,
      upsert: false, 
    });

    if (!updated) return res.status(404).json({ message: "Contact Us data not found" });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//submit contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body

    if (!name || !email || !subject || !message || !category) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      category,
    })

    res.status(201).json({ success: true, message: "Form submitted", data: newMessage })
  } catch (error) {
    console.error("Error in contact form submission:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// Get all contact messages
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete a contact message
exports.deleteContactByEmail = async (req, res) => {
  try {
      const email = req.params.email;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" })
    }

    const deleted = await ContactMessage.findOneAndDelete({ email })

    if (!deleted) {
      return res.status(404).json({ success: false, message: "No contact message found with this email" })
    }

    res.status(200).json({ success: true, message: "Contact message deleted successfully" })
  } catch (err) {
    console.error("Delete contact by email error:", err)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}