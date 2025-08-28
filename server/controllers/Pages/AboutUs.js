const AboutUs = require("../../models/Pages/AboutUs")

// 1. Create About Us (only once, usually)
exports.createAboutUs = async (req, res) => {
  try {
   
    const existing = await AboutUs.findOne();
    if (existing) {
      return res.status(400).json({ message: "About Us already exists. Use update instead." });
    }

    const about = new AboutUs(req.body);
    await about.save();

    res.status(201).json({ message: "About Us created successfully", about });
  } catch (error) {
    res.status(500).json({ message: "Failed to create About Us", error });
  }
};

// 2. Get About Us
exports.getAboutUs = async (req, res) => {
  try {
    const about = await AboutUs.findOne();
    if (!about) {
      return res.status(404).json({ message: "About Us data not found" });
    }

    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ message: "Failed to get About Us data", error });
  }
};

// 3. Update About Us
exports.updateAboutUs = async (req, res) => {
  try {
    let about = await AboutUs.findOne();
    if (!about) {
      return res.status(404).json({ message: "About Us not found. Create it first." });
    }

    Object.assign(about, req.body);
    await about.save();

    res.status(200).json({ message: "About Us updated successfully", about });
  } catch (error) {
    res.status(500).json({ message: "Failed to update About Us", error });
  }
};
