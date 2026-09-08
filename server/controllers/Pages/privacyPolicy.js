const PrivacyPolicy =require("../../models/Pages/privacyPolicy")


exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne();
    if (!policy) {
      return res.status(404).json({ message: 'Privacy policy not found' });
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create a privacy policy 
exports.createPrivacyPolicy = async (req, res) => {
  try {
    const existing = await PrivacyPolicy.findOne();
    if (existing) {
      return res.status(400).json({ message: 'Privacy policy already exists' });
    }
    const policy = new PrivacyPolicy(req.body);
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update the existing privacy policy
exports.updatePrivacyPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne();
    if (!policy) {
      return res.status(404).json({ message: 'Privacy policy not found' });
    }

    policy.header = req.body.header;
    policy.sections = req.body.sections;

    await policy.save();
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
