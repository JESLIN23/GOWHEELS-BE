const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../controllers/authController');
const {
  getCar,
  getAllCar,
  updateCar,
  createCar,
  deleteCar,
} = require('../controllers/carController');

router.route('/').get(getAllCar).post(protect, restrictTo('admin'), createCar);
router
  .route('/:id')
  .get(getCar)
  .delete(protect, restrictTo('admin'), deleteCar)
  .patch(protect, restrictTo('admin'), updateCar);

module.exports = router;
