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
  OrderChart,
} = require('../controllers/orderController');

router.get('/order-chart', protect, restrictTo('admin'), OrderChart)
router
  .route('/')
  .get(protect, restrictTo('admin'), getAllOrder)
  .post(protect, createOrder);
router
  .route('/:id')
  .get(protect, getOrder)
  .patch(protect, updateOrder)

router.patch('/close-order/:id', protect, restrictTo('admin'), closeOrder)
router.patch('/cancel-order/:id', protect, cancelOrder)

module.exports = router;
