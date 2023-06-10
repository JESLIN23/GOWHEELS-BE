const Cars = require('../models/carModel');
const Factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const multer = require('multer');
// const path = require('path')

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/images/car'); 
//   },
//   filename: (req, file, cb) => {
//     let ext = path.extname(file.originalname);
//     cb(null, `car-${req.params.id}-${Date.now()}${ext}`);
//   },
// });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true)
//   } else {
//     cb(new AppError('Not an image! Please upload an image', 400))
//   }
// }

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
//   limits: {
//     fileSize: 1024 * 1024 * 2
//   }
// })

// const saveCarImage = upload.single('file')

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
    let imgFile = { url: `${file.destination}${file.filename}` };
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
