const Cars = require('../models/carModel');
const Factory = require('../controllers/handlerFactory');

exports.getAllCar = Factory.getAll(Cars);
exports.getCar = Factory.getOne(Cars);
exports.createCar = Factory.createOne(Cars);
exports.updateCar = Factory.updateOne(Cars);
exports.deleteCar = Factory.deleteOne(Cars);
