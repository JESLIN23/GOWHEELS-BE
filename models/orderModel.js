const mongoose = require('mongoose');
const User = require('./userModel');
const Cars = require('./carModel');

const orderSchema = new mongoose.Schema(
  {
    orderId: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: [true, 'Booking must belong to a user!']
    },
    user_name: {
      type: String,
      trim: true,
      required: [true, 'Please provide username'],
    },
    status: {
      type: String,
      default: 'pending',
      enum: {
        values: ['pending', 'on-going', 'cancelled', 'completed'],
        message: 'Invalid status',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Booking must have an amount!']
    },
    pickup_date: {
      type: Date,
      required: [true, 'Booking must have pickup date'],
    },
    active: {
      type: Boolean,
      default: false,
    },
    closed: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    dropoff_date: {
      type: Date,
      required: [true, 'Booking must have dropoff date'],
    },
    pickup_location: {
      type: String,
    },
    dropoff_location: {
      type: String,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Cars,
      required: [true, 'Booking must belong to a car!'],
    },
    city: {
      type: String,
      required: [true, 'Please provide your city'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.pre('save', async function (next) {
  this.orderId = await getOrderCount() + 1;
  next();
});

orderSchema.pre(/^find/, function (next) {
  this.populate('user').populate('car')
  next()
})

const Order = mongoose.model('Order', orderSchema);

const getOrderCount = async () => {
  try {
    return await Order.countDocuments();
  } catch (error) {
    console.error('Error retrieving order count:', error);
  }
};

module.exports = Order;
