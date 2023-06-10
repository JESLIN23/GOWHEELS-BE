const multer = require('multer');
const path = require('path');

const multerStorageForCarImg = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/car/');
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `car-${req.params.id}-${Date.now()}${ext}`);
  },
});

const multerStorageForUserImg = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/avatar/');
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `car-${req.params.id}-${Date.now()}${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image', 400));
  }
};

const imageSizeLimit = { fileSize: 1024 * 1024 * 2 }

const uploadCarImg = multer({
  storage: multerStorageForCarImg,
  fileFilter: multerFilter,
  limits: imageSizeLimit
});

const uploadUserImg = multer({
  storage: multerStorageForUserImg,
  fileFilter: multerFilter,
  limits: imageSizeLimit
});

const saveCarImg = uploadCarImg.single('file')
const saveUserImg = uploadUserImg.single('avatar')

module.exports = {
    saveCarImg,
    saveUserImg
};
