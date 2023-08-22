const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/protectRoutes');
const {
  getAllCar,
  getCar,
  createCar,
  deleteCar,
  updateCar,
  uploadCarImage,
  getAvailableCars,
} = require('../controllers/carController');
const { saveCarImg } = require('../middleware/upload');
const { resizeCarImages } = require('../middleware/resizeImages');

router.get('/available-cars', getAvailableCars);
router.route('/').get(getAllCar).post(protect, restrictTo('admin'), createCar);
router
  .route('/:id')
  .get(getCar)
  .delete(protect, restrictTo('admin'), deleteCar)
  .patch(protect, restrictTo('admin'), updateCar);

router.patch(
  '/:id/image',
  protect,
  restrictTo('admin'),
  saveCarImg,
  resizeCarImages,
  uploadCarImage
);

module.exports = router;
