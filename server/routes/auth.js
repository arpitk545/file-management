const express =require('express');
const router =express.Router();
const { authenticate } =require('../middleware/auth');
const{usersignup,login,changePassword,logout} =require('../controllers/auth');

router.post('/signup',usersignup);
router.post('/login',login);
router.post('/logout',logout);
router.post('/change-password',authenticate,changePassword);

module.exports =router;