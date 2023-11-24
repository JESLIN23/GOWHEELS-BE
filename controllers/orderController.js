const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');
const Cars = require('../models/carModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Factory = require('../controllers/handlerFactory');
const User = require('../models/userModel');
const getRawBody = require('raw-body');
const contentType = require('content-type');

const getOrder = Factory.getOne(Order);
const updateOrder = Factory.updateOne(Order);

const getCheckoutSession = catchAsync(async (req, res, next) => {
  const data = req.body;

  const car = await Cars.findById(req.params.carId);

  const calculatedBookingPrice = (price) => {
    const pickupDate = new Date(data?.pickupDate?.pickup_date);
    const dropoffDate = new Date(data?.dropoffDate?.dropoff_date);

    const timeDifferenceMs = Math.abs(dropoffDate - pickupDate);
    const days = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifferenceMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const duration = `${days}.${hours}`;

    return Math.floor(duration * price);
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: req.user.email,
    client_reference_id: req.params.carId,
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: `${car.brand} ${car.name}`,
            images: [`${car.images[0].url}`],
          },
          unit_amount: calculatedBookingPrice(car?.price) * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${process.env.WEB_URL}/home`,
    cancel_url: `${req.protocol}://${process.env.WEB_URL}/home`,

    metadata: {
      pickup_date: data?.pickupDate?.pickup_date,
      dropoff_date: data?.dropoffDate?.dropoff_date,
      pickup_location: data?.pickupPoint?.pickup_location,
      dropoff_location: data?.dropoffPoint?.dropoff_location,
      city: data?.pickupPoint?.pickup_city,
    },
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    data: orders,
    count: orders.length,
  });
});

const getAllOrder = catchAsync(async (req, res) => {
  const features = new APIFeatures(Order.find(), req.query)
    .search(['user_name', 'city', 'status', 'car_name'])
    .filter()
    .pagination();
  const document = await features.query;

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

  const document = await Order.findById(order._id);

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

const createOrderCheckout = async (session) => {
  const car = session.client_reference_id;
  const user = await User.findOne({ email: session?.customer_email });
  const price = session.amount_subtotal / 100;
  const document = await Order.create({
    user: user._id,
    user_name: user.name,
    car,
    amount: price,
    pickup_date: session.metadata.pickup_date,
    pickup_location: session.metadata.pickup_location,
    dropoff_date: session.metadata.dropoff_date,
    dropoff_location: session.metadata.dropoff_location,
    city: session.metadata.city,
  });

  if (document) {
    const car = await Cars.findById(document.car._id);
    car.active_bookings.push({
      pickup_date: document.pickup_date,
      dropoff_date: document.dropoff_date,
      orderId: document._id,
    });
    await car.save();
  }
};

const webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb',
    encoding: contentType.parse(req).parameters.charset
  }, function (err, string) {
    if (err) {
      console.error('Error reading raw body:', err);
      return res.status(500).send('Internal Server Error');
    }
  
    req.text = string;
  
    // Log the raw body and its type after it's obtained
    console.log(req.text);
    console.log('Type of rawBody:', typeof req.text);
  })

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`webhook error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    console.log(event.type, event.data.object);
    await createOrderCheckout(event.data.object);

    return res.status(200).json({ received: true });
  }
};

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
  );

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
  getCheckoutSession,
  getAllOrder,
  getOrder,
  updateOrder,
  createOrder,
  closeOrder,
  cancelOrder,
  OrderChart,
  getMyOrders,
  webhookCheckout,
};
