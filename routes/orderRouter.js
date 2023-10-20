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

router.use(protect)

router.post('/checkout-session/:carId', getCheckoutSession)
router.get('/order-chart', restrictTo('admin'), OrderChart)
router.get('/my-orders', getMyOrders)
router
  .route('/')
  .get( restrictTo('admin'), getAllOrder)
router
  .route('/:id')
  .get( getOrder)
  .patch( updateOrder)

router.patch('/close-order/:id', restrictTo('admin'), closeOrder)
router.patch('/cancel-order/:id', cancelOrder)

module.exports = router;
