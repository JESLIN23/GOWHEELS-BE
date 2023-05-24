const Cars = require('../models/carModel');
const Factory = require('../controllers/handlerFactory');

const getAllCar = Factory.getAll(Cars);
const getCar = Factory.getOne(Cars);
const createCar = Factory.createOne(Cars);
const updateCar = Factory.updateOne(Cars);
const deleteCar = Factory.deleteOne(Cars);

module.exports = {
  getAllCar,
  getCar,
  createCar,
  updateCar,
  deleteCar,
};
