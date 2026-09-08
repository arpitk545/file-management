const TermsCondition = require("../../models/Pages/termsCondition");


exports.getTermsCondition = async (req, res) => {
  try {
    const terms = await TermsCondition.findOne();
    if (!terms) {
      return res.status(404).json({ message: 'Terms and Conditions not found' });
    }
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create terms and conditions 
exports.createTermsCondition = async (req, res) => {
  try {
    const existing = await TermsCondition.findOne();
    if (existing) {
      return res.status(400).json({ message: 'Terms and Conditions already exists' });
    }
    const terms = new TermsCondition(req.body);
    await terms.save();
    res.status(201).json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update the existing terms and conditions
exports.updateTermsCondition = async (req, res) => {
  try {
    const terms = await TermsCondition.findOne();
    if (!terms) {
      return res.status(404).json({ message: 'Terms and Conditions not found' });
    }

    terms.header = req.body.header;
    terms.sections = req.body.sections;

    await terms.save();
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
