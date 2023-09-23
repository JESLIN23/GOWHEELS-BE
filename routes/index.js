const express = require('express');
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const carRouter = require('./carRouter');
const orderRouter = require('./orderRouter');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/car', carRouter);
router.use('/order', orderRouter);

module.exports = router;
