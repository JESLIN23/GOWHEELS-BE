const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const Factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getAllUser = Factory.getAll(User, { role: { $ne: 'admin' } });
const getUser = Factory.getOne(User);
const createUser = Factory.createOne(User);
const updateUser = Factory.updateOne(User);
const deleteUser = Factory.deleteOne(User);

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'You cant update password here. Please try change password',
        400
      )
    );
  }
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'secondName',
    'phone',
    'email',
    'avatar',
    'driving_licence'
  );

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const uploadUserImage = catchAsync(async (req, res, next) => {
  const file = req.file;
  const id = req.params.id;
  const user = await User.findById(id);

  if (user) {
    let imgFile = {
      url: `${process.env.BASE_URL}${file.destination}${file.filename}`,
    };
    user.avatar = imgFile;

    await user.save();
  } else {
    return new AppError('There is no user with this id.', 400);
  }

  res.status(204).json({
    status: 'success',
  });
});

const uploadLicenceFront = catchAsync(async (req, res, next) => {
  const file = req.file;
  const id = req.params.id;
  const user = await User.findById(id);

  if (user) {
    let imgFile = {
      url: `${process.env.BASE_URL}${file.destination}${file.filename}`,
    };
    user.driving_licence.frond = imgFile;

    await user.save();
  } else {
    return new AppError('There is no user with this id.', 400);
  }

  res.status(204).json({
    status: 'success',
  });
});

const uploadLicenceBack = catchAsync(async (req, res, next) => {
  const file = req.file;
  const id = req.params.id;
  const user = await User.findById(id);

  if (user) {
    let imgFile = {
      url: `${process.env.BASE_URL}${file.destination}${file.filename}`,
    };
    user.driving_licence.back = imgFile;

    await user.save();
  } else {
    return new AppError('There is no user with this id.', 400);
  }

  res.status(204).json({
    status: 'success',
  });
});

// const deactive = catchAsync(async (req, res, next) => {
//   console.log(req.body.id);
//   const id = req?.body?.id;
//   const user = await User.findByIdAndUpdate(id, { active: false });

//   if (!user) {
//     return next(new AppError('User not found with this id', 404));
//   }

//   if (user?.active === false) {
//     return next(new AppError('User with this id already deactive', 400))
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//     message: 'User deactivated',
//   });
// });

module.exports = {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  uploadUserImage,
  uploadLicenceFront,
  uploadLicenceBack,
};
