const { promisify } = require('util');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Unauthorized! Please log in again', 401))
    }
     
    token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(new AppError('You are not logged in! Please log in', 401));
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    const currentUser = await User.findById(decoded.id);
  
    if (!currentUser) return next(new AppError('The user no longer exist', 401));
  
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('Please log in again after changing passwords', 401)
      );
    }
  
    req.user = currentUser;
    next();
  });
  
  const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
      next();
    };
  };
  
  module.exports = {
    restrictTo,
    protect
  }