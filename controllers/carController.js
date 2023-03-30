const Cars = require('../models/carModal');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const getAllCar = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Cars.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const cars = await features.query;

  res.status(200).json({
    status: 'success',
    results: cars.length,
    data: {
      cars,
    },
  });
});

const getCar = catchAsync(async (req, res, next) => {
  const car = await Cars.findById(req.params.id);

  if (!car) return next(new AppError('No car found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      car,
    },
  });
});

const createCar = catchAsync(async (req, res, next) => {
  const newCar = await Cars.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newCar,
    },
  });
});

const updateCar = catchAsync(async (req, res, next) => {
  const car = await Cars.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!car) return next(new AppError('No car found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      car,
    },
  });
});

const deleteCar = catchAsync(async (req, res, next) => {
  const car = await Cars.findByIdAndDelete(req.params.id);

  if (!car) return next(new AppError('No car found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getCar,
  getAllCar,
  updateCar,
  createCar,
  deleteCar,
};
