const express = require('express');
const router = express.Router();

const {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
} = require('../controllers/userController');
const { protect } = require('../middleware/protectRoutes');

router.patch('/updateMe', protect, updateMe);
// router.patch('/deactive', protect, deactive);

router.route('/').get(protect, getAllUser).post(createUser);
router
  .route('/:id')
  .get(protect, getUser)
  .delete(protect, deleteUser)
  .patch(protect, updateUser);

module.exports = router;
