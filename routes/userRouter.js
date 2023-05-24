const express = require('express');
const router = express.Router();

const {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  deactivated,
} = require('../controllers/userController');
const { protect } = require('../middleware/protectRoutes');

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);
router.get('/deactivated', protect, deactivated);

router.route('/').get(getAllUser).post(createUser);
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser);

module.exports = router;
