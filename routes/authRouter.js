const express = require('express');
const router = express.Router();

const {
  login,
  signup,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyPhone,
  sendEmailVerification,
  sendVerificationOTP,
} = require('../controllers/authController');
const { protect } = require('../middleware/protectRoutes');
const { handleRefreshToken } = require('../controllers/refreshTokenController');

router.post('/signup', signup);
router.post('/login', login);
router.delete('/logout', protect, logout);
router.get('/refresh', handleRefreshToken);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', verifyPhone);
router.post('/phone-verification-otp', protect, sendVerificationOTP);
router.post('/email-verification', protect, sendEmailVerification);

router.post('/forgetPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);

module.exports = router;
