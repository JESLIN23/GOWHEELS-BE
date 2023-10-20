const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/protectRoutes');
const {
  getAllOrder,
  getOrder,
  updateOrder,
  closeOrder,
  cancelOrder,
  OrderChart,
  getCheckoutSession,
  getMyOrders,
  webhookCheckout,
} = require('../controllers/orderController');

router.post('/checkout-session/:carId', protect, getCheckoutSession);
router.get('/order-chart', protect, restrictTo('admin'), OrderChart);
router.get('/my-orders', protect, getMyOrders);
router
  .route('/')
  .get(protect, restrictTo('admin'), getAllOrder)
  .post( express.text(), webhookCheckout);

router.route('/:id').get(protect, getOrder).patch(protect, updateOrder);

router.patch('/close-order/:id', restrictTo('admin'), closeOrder);
router.patch('/cancel-order/:id', cancelOrder);

module.exports = router;
