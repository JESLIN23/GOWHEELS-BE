const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A car must have a name'],
    trim: true,
    unique: true,
    minLength: [5, 'A car name must have alteast 5 charactor'],
    maxLength: [30, 'A car name must have lesthan 30 charactor'],
  },
  transmission: {
    type: String,
    required: [true, 'A car must have a transmission type'],
    trim: true,
    enum: {
      values: ['manual', 'automatic'],
      message: 'Transmission should be manual or automatic',
    },
  },
  seating_capacity: {
    type: Number,
    required: [true, 'Seating capicity is required'],
    min: [4, 'Seating capacity must be 4 or above '],
    max: [9, 'Seating capacity must be 9 or less']
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    minLength: [3, 'Brand name must have alteast 3 charactor'],
    maxLength: [20, 'Brand name must have lessthan 20 charactor'],
    trim: true,
  },
  fuel: {
    type: String,
    required: [true, 'Car must have a fuel type'],
    trim: true,
    enum: {
      values: ['petrol', 'diesel', 'electric'],
      message: 'Fuel type should be petrol, diesel or electric',
    },
  },
  segment: {
    type: String,
    required: [true, 'Segment type is required'],
    trim: true,
    enum: {values: [hatchback, SUV, sedan, MPV, convertable, wagon], message: 'Segment type is invalid'}
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  booked: {
    type: Boolean,
    default: false
  },
  BookedAt: {
    type: Date
  },
  BookedTo: {
    type: Date
  }
});

const Cars = mongoose.model('Cars', carSchema);

module.exports = Cars;
