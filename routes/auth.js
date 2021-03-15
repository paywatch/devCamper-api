const express = require('express');
const {
  register,
  login,
  getMe,
  forgetPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout
} = require('../controller/auth');

const router = express.Router();

const {
  protect
} = require('../moddleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgetPassword);
router.put('/resetpassword/:resettoken', resetPassword);



module.exports = router;