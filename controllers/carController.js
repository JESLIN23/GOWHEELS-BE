const Cars = require('../models/carModel');
const Factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const getAllCar = Factory.getAll(Cars);
const getCar = Factory.getOne(Cars);
const createCar = Factory.createOne(Cars);
const updateCar = Factory.updateOne(Cars);
const deleteCar = Factory.deleteOne(Cars);

const uploadCarImage = catchAsync(async (req, res, next) => {
  const file = req.file;
  const id = req.params.id;
  const car = await Cars.findById(id);

  if (car) {
    let imgFile = {
      url: `${process.env.WEB_URL}${file.destination}${file.filename}`,
    };
    car.images.push(imgFile);

    await car.save();
  } else {
    return new AppError('There is no car with this id.', 400);
  }

  res.status(204).json({
    status: 'success',
  });
});

const getAvailableCars = catchAsync(async (req, res, next) => {
  const {
    pickup_city,
    segment,
    fuel,
    transmission,
    pickup_date,
  } = req.query;
  const query = { city: pickup_city, segment, fuel, transmission };
  const features = new APIFeatures(Cars.find(), query).filter();
  const document = await features.query;

  let data = { available_cars: [], booked_cars: [] };

  document.forEach((doc) => {
    if (!doc.active_bookings || doc?.active_bookings.length === 0) {
      data.available_cars.push(doc);
    } else {
      const isBooked = doc?.active_bookings.some((booking) => {
        const bookingPickupDate = new Date(booking.pickup_date);
        const bookingDropoffDate = new Date(booking.dropoff_date);
        const queryPickupDate = new Date(pickup_date);

        return (
          queryPickupDate >= bookingPickupDate &&
          queryPickupDate <= bookingDropoffDate
        );
      });

      if (isBooked) {
        data.booked_cars.push(doc);
      } else {
        data.available_cars.push(doc);
      }
    }
    return;
  });

  res.status(200).json({
    status: 'success',
    data,
  });
});

module.exports = {
  getAllCar,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  uploadCarImage,
  getAvailableCars,
};
