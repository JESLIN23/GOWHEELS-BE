const multer = require('multer');
const path = require('path');

const multerStorageForImg = multer.memoryStorage()
// const multerStorageForCarImg = multer.memoryStorage()
// const multerStorageForLicenceImg = multer.memoryStorage()
// const multerStorageForCarImg = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/images/car/')
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname)
//     cb(null, `car-${req.params.id}-${Date.now()}${ext}`)
//   }
// })

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image', 400), false);
  }
};

const imageSizeLimit = { fileSize: 1024 * 1024 * 2 }

const uploadImg = multer({
  storage: multerStorageForImg,
  fileFilter: multerFilter,
  limits: imageSizeLimit
});
// const uploadUserImg = multer({
//   storage: multerStorageForUserImg,
//   fileFilter: multerFilter,
//   limits: imageSizeLimit
// });
// const uploadLicenceImg = multer({
//   storage: multerStorageForLicenceImg,
//   fileFilter: multerFilter,
//   limits: imageSizeLimit
// });

const saveCarImg = uploadImg.single('file')
// const saveUserImg = uploadImg.single('avatar')
// const saveLicenceImg = uploadImg.single('licence')
const saveUserImg = uploadImg.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'licence_front', maxCount: 1 },
  { name: 'licence_back', maxCount: 1 }
])

module.exports = {
    saveCarImg,
    saveUserImg,
};
