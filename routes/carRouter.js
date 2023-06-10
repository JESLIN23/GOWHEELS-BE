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
} = require('../controllers/carController');

const { saveCarImg } = require('../middleware/upload')



router.route('/').get(getAllCar).post(protect, restrictTo('admin'), createCar);
router
  .route('/:id')
  .get(getCar)
  .delete(protect, restrictTo('admin'), deleteCar)
  .patch(protect, restrictTo('admin'), updateCar);

router.patch('/:id/image', protect, restrictTo('admin'), saveCarImg, uploadCarImage);

module.exports = router;


