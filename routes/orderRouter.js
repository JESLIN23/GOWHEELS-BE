const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/protectRoutes');
const {
  getAllOrder,
  getOrder,
  createOrder,
  updateOrder,
  closeOrder,
  cancelOrder,
} = require('../controllers/orderController');

router
  .route('/')
  .get(protect, restrictTo('admin'), getAllOrder)
  .post(protect, createOrder);
router
  .route('/:id')
  .get(protect, getOrder)
  .patch(protect, updateOrder)

router.patch('/close-order/:id', closeOrder)
router.patch('/cancel-order/:id', cancelOrder)
module.exports = router;
