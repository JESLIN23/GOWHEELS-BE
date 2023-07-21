const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');
const Cars = require('../models/carModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const getAllOrder = catchAsync(async (req, res) => {
  const features = new APIFeatures(Order.find(), req.query)
    .search(['user_name', 'city', 'status', 'car_name'])
    .filter()
    .pagination();
  const document = await features.query.populate('car').populate('user');

  res.status(200).json({
    status: 'success',
    data: {
      document,
    },
  });
});

const getOrder = catchAsync(async (req, res) => {
  const document = await Order.findById(req.params.id)
    .populate('car')
    .populate('user');

  res.status(200).json({
    status: 'success',
    data: {
      document,
    },
  });
});

const updateOrder = catchAsync(async (req, res) => {
  const document = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
    .populate('car')
    .populate('user');

  res.status(200).json({
    status: 'success',
    data: {
      document,
    },
  });
});

const createOrder = catchAsync(async (req, res) => {
  const order = new Order(req.body);
  await order.save();

  const document = await Order.findById(order._id)
    .populate('car')
    .populate('user');

  if (document) {
    const car = await Cars.findById(document.car._id);
    car.active_bookings.push({
      pickup_date: document.pickup_date,
      dropoff_date: document.dropoff_date,
      orderId: document._id,
    });
    await car.save();
  }

  res.status(201).json({
    status: 'success',
    data: {
      document,
    },
  });
});

const closeOrder = catchAsync(async (req, res) => {
  const document = await Order.findByIdAndUpdate(req.params.id, {
    closed: true,
  });

  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }

  // remove from active bookings
  await Cars.findByIdAndUpdate(document.car, {
    $pull: { active_bookings: { orderId: document._id } },
  });

  res.status(200).json({
    status: 'success',
  });
});

const cancelOrder = catchAsync(async (req, res) => {
  const document = await Order.findByIdAndUpdate(
    req.params.id,
    {
      verified: true,
      status: 'cancelled',
    },
    {
      new: true,
    }
  )
    .populate('car')
    .populate('user');

  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }

  // remove from active bookings
  await Cars.findByIdAndUpdate(document.car, {
    $pull: { active_bookings: { orderId: document._id } },
  });

  res.status(200).json({
    status: 'success',
    data: {
      document,
    },
  });
});

const OrderChart = catchAsync(async (req, res) => {
  const year = parseInt(req?.query?.year);
  const document = await Order.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $year: '$pickup_date' }, year],
        },
      },
    },
    {
      $group: {
        _id: {
          city: '$city',
          month: { $month: '$pickup_date' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.city',
        months: {
          $push: {
            month: '$_id.month',
            count: '$count',
          },
        },
      },
    },
    {
      $addFields: {
        months: {
          $arrayToObject: {
            $map: {
              input: [
                { month: 1, name: 'January' },
                { month: 2, name: 'February' },
                { month: 3, name: 'March' },
                { month: 4, name: 'April' },
                { month: 5, name: 'May' },
                { month: 6, name: 'June' },
                { month: 7, name: 'July' },
                { month: 8, name: 'August' },
                { month: 9, name: 'September' },
                { month: 10, name: 'October' },
                { month: 11, name: 'November' },
                { month: 12, name: 'December' },
              ],
              as: 'm',
              in: {
                k: '$$m.name',
                v: {
                  $let: {
                    vars: {
                      matchedMonth: {
                        $filter: {
                          input: '$months',
                          as: 'month',
                          cond: { $eq: ['$$month.month', '$$m.month'] },
                        },
                      },
                    },
                    in: {
                      $cond: [
                        { $gt: [{ $size: '$$matchedMonth' }, 0] },
                        { $arrayElemAt: ['$$matchedMonth.count', 0] },
                        0,
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      document,
    },
  });
});

module.exports = {
  getAllOrder,
  getOrder,
  updateOrder,
  createOrder,
  closeOrder,
  cancelOrder,
  OrderChart,
};
