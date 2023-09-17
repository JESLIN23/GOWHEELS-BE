"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../middleware/protectRoutes'),
    protect = _require.protect,
    restrictTo = _require.restrictTo;

var _require2 = require('../controllers/orderController'),
    getAllOrder = _require2.getAllOrder,
    getOrder = _require2.getOrder,
    createOrder = _require2.createOrder,
    updateOrder = _require2.updateOrder,
    closeOrder = _require2.closeOrder,
    cancelOrder = _require2.cancelOrder,
    OrderChart = _require2.OrderChart,
    getCheckoutSession = _require2.getCheckoutSession;

router.get('/checkout-session/:carId', protect, getCheckoutSession);
router.get('/order-chart', protect, restrictTo('admin'), OrderChart);
router.route('/').get(protect, restrictTo('admin'), getAllOrder).post(protect, createOrder);
router.route('/:id').get(protect, getOrder).patch(protect, updateOrder);
router.patch('/close-order/:id', protect, restrictTo('admin'), closeOrder);
router.patch('/cancel-order/:id', protect, cancelOrder);
module.exports = router;