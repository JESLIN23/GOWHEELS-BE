const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
} = require('../controllers/authController');
const {
  getAllUser,
  getUser,
  updateUser,
  createUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgetPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(getAllUser).post(createUser);
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = router;
