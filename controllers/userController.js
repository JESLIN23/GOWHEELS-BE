const User = require('../models/userModal');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const apiFeatures = require('../utils/apiFeatures');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getAllUser = catchAsync(async (req, res, next) => {
  const features = new apiFeatures(User.find, req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const user = await features.query;

  if (!user) {
    return next(new AppError('There is no users.', 400));
  }

  res.status(200).json({
    status: 'success',
    length: user.length,
    data: {
      user,
    },
  });
});

const getUser = (req, res) => {};

const createUser = (req, res) => {};

const updateUser = (req, res) => {};

const deleteUser = (req, res) => {};

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
    'date_of_birth',
    'photo',
    'phone',
    'gender',
    'email'
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

const deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
