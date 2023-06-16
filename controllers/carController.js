const Cars = require('../models/carModel');
const Factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
    // let imgFile = { url: `${process.env.WEB_URL}/${file.destination}${file.filename}` };
    let imgFile = { url: `${process.env.WEB_URL}${file.destination}${file.filename}` };
    car.images.push(imgFile);

    await car.save();
  } else {
    return new AppError('There is no car with this id.', 400);
  }

  res.status(204).json({
    status: 'success',
  })
});

module.exports = {
  getAllCar,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  uploadCarImage,
};
