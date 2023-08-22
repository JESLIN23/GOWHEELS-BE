const express = require('express');
const router = express.Router();

const {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  uploadUserImage,
  uploadLicenceFront,
  uploadLicenceBack,
} = require('../controllers/userController');
const { protect } = require('../middleware/protectRoutes');
const { saveUserImg, saveLicenceImg } = require('../middleware/upload');
const {
  resizeUserImages,
  resizeLicenceImages,
} = require('../middleware/resizeImages');

router.patch('/updateMe', protect, updateMe);
// router.patch('/deactive', protect, deactive);

router.route('/').get(protect, getAllUser).post(createUser);
router
  .route('/:id')
  .get(protect, getUser)
  .delete(protect, deleteUser)
  .patch(protect, updateUser);

router.patch(
  '/:id/avatar',
  protect,
  saveUserImg,
  resizeUserImages,
  uploadUserImage
);
router.patch(
  '/:id/licence-front',
  protect,
  saveLicenceImg,
  resizeLicenceImages,
  uploadLicenceFront
);
router.patch(
  '/:id/licence-back',
  protect,
  saveLicenceImg,
  resizeLicenceImages,
  uploadLicenceBack
);

module.exports = router;
