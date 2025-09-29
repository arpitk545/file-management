const express = require('express');
const router = express.Router();
const { upsertProfile,getMyProfile,updateProfile,getManagersAndUsers,blockOrUnblockUser } = require('../controllers/profile');
const { authenticate } = require('../middleware/auth');

router.post('/create-profile', authenticate, upsertProfile);
router.get('/my-profile', authenticate, getMyProfile);
router.put('/update-profile', authenticate, updateProfile);
router.get('/managers-and-users', authenticate, getManagersAndUsers);
router.patch('/block-or-unblock-user', authenticate, blockOrUnblockUser);

module.exports = router;