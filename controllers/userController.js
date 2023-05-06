const User = require('../models/userModel');
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

const getAllUser = Factory.getAll(User);
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
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const deactivated = catchAsync(async (req, res, next) => {
  const deactivatedUsers = await User.find({ isActive: false });

  res.status(200).json({
    status: 'success',
    data: deactivatedUsers,
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
  deactivated,
};
