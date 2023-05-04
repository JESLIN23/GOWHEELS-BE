const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const carController = require('../controllers/carController');

router
  .route('/')
  .get(carController.getAllCar)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    carController.createCar
  );
router
  .route('/:id')
  .get(carController.getCar)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    carController.deleteCar
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    carController.updateCar
  );

module.exports = router;
