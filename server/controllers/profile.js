const Profile = require('../models/profile');
const User = require('../models/auth');
const uploadImageToCloudinary = require('../config/cloudinary').uploadImageToCloudinary;
const fs = require('fs');

exports.upsertProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName, mobile, gender, dob, address, country } = req.body;

  try {
    let profileImageUrl = req.body.profileImage;

    if (req.files?.profileImage) {
      const file = req.files.profileImage;
      profileImageUrl = await uploadImageToCloudinary(file, 'profile_images', 400, 80);

      if (file.tempFilePath) {
        fs.unlink(file.tempFilePath, (err) => {
          if (err) console.warn('Temp file deletion error:', err);
        });
      }
    }
    if (profileImageUrl && typeof profileImageUrl === "object") {
     profileImageUrl = profileImageUrl.url || ""; 
     }

    const profileData = {
      fullName,
      mobile,
      gender,
      dob,
      address,
      country,
      profileImage: profileImageUrl,
      user: userId,
      lastLogin: new Date(),
    };

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      profileData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(profile);
  } catch (err) {
    console.error('Profile upsert error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//get my profile 
exports.getMyProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await Profile.findOne({ user: userId }).populate('user', 'email role createdAt');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//update profile 
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName, mobile, gender, dob, address, country } = req.body;

  try {
    let profileImageUrl = req.body.profileImage;

    if (req.files?.profileImage) {
      const file = req.files.profileImage;
      profileImageUrl = await uploadImageToCloudinary(file, 'profile_images', 400, 80);

      if (file.tempFilePath) {
        fs.unlink(file.tempFilePath, (err) => {
          if (err) console.warn('Temp file deletion error:', err);
        });
      }
    }

    const profileData = {
      fullName,
      mobile,
      gender,
      dob,
      address,
      country,
      profileImage: profileImageUrl,
      lastLogin: new Date(),
    };

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      profileData,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(updatedProfile);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//Get user profile to block or unblock 
exports.getManagersAndUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['manager', 'user'] } })
            .select('email role isBlocked createdAt')
            .lean();

        const userIds = users.map(user => user._id);

        const profiles = await Profile.find({ user: { $in: userIds } })
            .select('user fullName mobile country profileImage') 
            .lean();

        const mergedData = users.map(user => {
            const profile = profiles.find(p => p.user.toString() === user._id.toString());
            return {
                _id: user._id,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked || false,
                createdAt: user.createdAt,
                avatar: profile?.profileImage,
                fullName: profile?.fullName || '',
                mobile: profile?.mobile || '',
                country: profile?.country || ''
            };
        });

        res.status(200).json(mergedData);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.blockOrUnblockUser = async (req, res) => {
    try {
        const { email, role } = req.body;
        const { block } = req.body; 
        if (typeof block !== 'boolean') {
            return res.status(400).json({ message: 'Invalid block value' });
        }
        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        // Find user by email and role
        const user = await User.findOne({ email, role });

        if (!user || user.role === 'admin') {
            return res.status(404).json({ message: 'User not found or cannot block admin' });
        }

        user.isBlocked = block;
        await user.save();

        res.status(200).json({ message: `User has been ${block ? 'blocked' : 'unblocked'}` });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
