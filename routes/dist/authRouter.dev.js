"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../controllers/authController'),
    login = _require.login,
    signup = _require.signup,
    logout = _require.logout,
    verifyEmail = _require.verifyEmail,
    forgotPassword = _require.forgotPassword,
    resetPassword = _require.resetPassword,
    updatePassword = _require.updatePassword,
    verifyPhone = _require.verifyPhone,
    sendEmailVerification = _require.sendEmailVerification,
    sendVerificationOTP = _require.sendVerificationOTP,
    userProfile = _require.userProfile,
    loginAdmin = _require.loginAdmin;

var _require2 = require('../middleware/protectRoutes'),
    protect = _require2.protect;

var _require3 = require('../controllers/refreshTokenController'),
    handleRefreshToken = _require3.handleRefreshToken;

router.post('/signup', signup);
router.post('/login', login);
router.post('/login-admin', loginAdmin);
router["delete"]('/logout', protect, logout);
router.post('/refresh', handleRefreshToken);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', verifyPhone);
router.post('/phone-verification-otp', protect, sendVerificationOTP);
router.post('/email-verification', protect, sendEmailVerification);
router.get('/user-profile', protect, userProfile);
router.post('/forgot-password', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);
module.exports = router;