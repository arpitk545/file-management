const Disclaimer = require('../../models/Pages/disclaimer');

exports.getDisclaimer = async (req, res) => {
  try {
    const disclaimer = await Disclaimer.findOne();
    if (!disclaimer) {
      return res.status(404).json({ message: 'Disclaimer not found' });
    }
    res.json(disclaimer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.updateDisclaimer = async (req, res) => {
  try {
    const data = req.body;

    let disclaimer = await Disclaimer.findOne();
    if (disclaimer) {
      disclaimer.set(data);
      await disclaimer.save();
    } else {
      disclaimer = await Disclaimer.create(data);
    }

    res.status(200).json({ message: 'Disclaimer updated successfully', disclaimer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.createDisclaimer = async (req, res) => {
  try {
    const data = req.body;
    const existing = await Disclaimer.findOne();
    if (existing) {
      return res.status(400).json({ message: 'A disclaimer already exists. Use update instead.' });
    }

    const disclaimer = await Disclaimer.create(data);
    res.status(201).json({ message: 'Disclaimer created successfully', disclaimer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
