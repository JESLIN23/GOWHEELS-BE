const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A car must have a name'],
      trim: true,
      minLength: [2, 'A car name must have alteast 3 charactor'],
      maxLength: [30, 'A car name must have lesthan 30 charactor'],
    },
    transmission: {
      type: String,
      required: [true, 'A car must have a transmission type'],
      trim: true,
      enum: {
        values: ['Manual', 'Automatic', 'Semi-automatic'],
        message: 'Transmission should be manual or automatic',
      },
    },
    seating_capacity: {
      type: Number,
      required: [true, 'Seating capicity is required'],
      min: [2, 'Seating capacity must be 4 or above '],
      max: [11, 'Seating capacity must be 9 or less'],
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      minLength: [2, 'Brand name must have alteast 3 charactor'],
      maxLength: [30, 'Brand name must have lessthan 20 charactor'],
      trim: true,
    },
    fuel: {
      type: String,
      required: [true, 'Car must have a fuel type'],
      trim: true,
      enum: {
        values: ['Petrol', 'Diesel', 'Electric'],
        message: 'Fuel type should be petrol, diesel or electric',
      },
    },
    segment: {
      type: String,
      required: [true, 'Segment type is required'],
      trim: true,
      enum: {
        values: ['Hatchback', 'SUV', 'Sedan', 'MUV', 'Convertable', 'Wagon'],
        message: 'Segment type is invalid',
      },
    },
    city: [
      {
        type: String,
        required: [true, 'City is required'],
      },
    ],
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    registerNo: {
      type: String,
      required: [true, 'Please enter the register number'],
    },
    images: [
      {
        id: String,
        url: String,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    active_bookings: [],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Cars = mongoose.model('Cars', carSchema);

module.exports = Cars;
