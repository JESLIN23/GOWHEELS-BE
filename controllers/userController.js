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
};
