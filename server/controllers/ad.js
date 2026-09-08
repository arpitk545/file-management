const Ad = require("../models/Ad");

exports.saveAd = async (req, res) => {
  try {
    const { format, client, slot } = req.body;
    
    if (!format || !client || !slot) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let ad = await Ad.findOne({});
    if (ad) {
      ad.format = format;
      ad.client = client;
      ad.slot = slot;
      await ad.save();
    } else {
      ad = await Ad.create({ format, client, slot });
    }

    res.status(200).json({ success: true, data: ad, message: "Ad configuration saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error saving Ad", error: err.message });
  }
};

exports.getAd = async (req, res) => {
  try {
    const ad = await Ad.findOne({ isActive: true });
    if (!ad) {
      return res.status(404).json({ success: false, message: "No active ad found" });
    }
    res.status(200).json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching Ad", error: err.message });
  }
};
