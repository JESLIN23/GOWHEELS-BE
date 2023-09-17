"use strict";

var User = require('../models/userModel');

var Token = require('../models/tokenModel');

var Factory = require('../controllers/handlerFactory');

var catchAsync = require('../utils/catchAsync');

var AppError = require('../utils/appError');

var filterObj = function filterObj(obj) {
  for (var _len = arguments.length, allowedFields = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    allowedFields[_key - 1] = arguments[_key];
  }

  var newObj = {};
  Object.keys(obj).forEach(function (el) {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

var getAllUser = Factory.getAll(User, {
  role: {
    $ne: 'admin'
  }
});
var getUser = Factory.getOne(User);
var createUser = Factory.createOne(User);
var updateUser = Factory.updateOne(User);
var deleteUser = Factory.deleteOne(User);
var updateMe = catchAsync(function _callee(req, res, next) {
  var filteredBody, updatedUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.body.password || req.body.passwordConfirm)) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next(new AppError('You cant update password here. Please try change password', 400)));

        case 2:
          filteredBody = filterObj(req.body, 'firstName', 'secondName', 'phone', 'email', 'avatar', 'driving_licence');
          _context.next = 5;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, filteredBody, {
            "new": true,
            runValidators: true
          }));

        case 5:
          updatedUser = _context.sent;
          res.status(200).json({
            status: 'success',
            data: {
              user: updatedUser
            }
          });

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});
var uploadUserImage = catchAsync(function _callee2(req, res, next) {
  var file, id, user, imgFile;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          file = req.file;
          id = req.params.id;
          _context2.next = 4;
          return regeneratorRuntime.awrap(User.findById(id));

        case 4:
          user = _context2.sent;

          if (!user) {
            _context2.next = 12;
            break;
          }

          imgFile = {
            url: "".concat(process.env.BASE_URL).concat(file.destination).concat(file.filename)
          };
          user.avatar = imgFile;
          _context2.next = 10;
          return regeneratorRuntime.awrap(user.save());

        case 10:
          _context2.next = 13;
          break;

        case 12:
          return _context2.abrupt("return", new AppError('There is no user with this id.', 400));

        case 13:
          res.status(204).json({
            status: 'success'
          });

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
});
var uploadLicenceFront = catchAsync(function _callee3(req, res, next) {
  var file, id, user, imgFile;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          file = req.file;
          id = req.params.id;
          _context3.next = 4;
          return regeneratorRuntime.awrap(User.findById(id));

        case 4:
          user = _context3.sent;

          if (!user) {
            _context3.next = 12;
            break;
          }

          imgFile = {
            url: "".concat(process.env.BASE_URL).concat(file.destination).concat(file.filename)
          };
          user.driving_licence.frond = imgFile;
          _context3.next = 10;
          return regeneratorRuntime.awrap(user.save());

        case 10:
          _context3.next = 13;
          break;

        case 12:
          return _context3.abrupt("return", new AppError('There is no user with this id.', 400));

        case 13:
          res.status(204).json({
            status: 'success'
          });

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  });
});
var uploadLicenceBack = catchAsync(function _callee4(req, res, next) {
  var file, id, user, imgFile;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          file = req.file;
          id = req.params.id;
          _context4.next = 4;
          return regeneratorRuntime.awrap(User.findById(id));

        case 4:
          user = _context4.sent;

          if (!user) {
            _context4.next = 12;
            break;
          }

          imgFile = {
            url: "".concat(process.env.BASE_URL).concat(file.destination).concat(file.filename)
          };
          user.driving_licence.back = imgFile;
          _context4.next = 10;
          return regeneratorRuntime.awrap(user.save());

        case 10:
          _context4.next = 13;
          break;

        case 12:
          return _context4.abrupt("return", new AppError('There is no user with this id.', 400));

        case 13:
          res.status(204).json({
            status: 'success'
          });

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // const deactive = catchAsync(async (req, res, next) => {
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
  getAllUser: getAllUser,
  getUser: getUser,
  createUser: createUser,
  updateUser: updateUser,
  deleteUser: deleteUser,
  updateMe: updateMe,
  uploadUserImage: uploadUserImage,
  uploadLicenceFront: uploadLicenceFront,
  uploadLicenceBack: uploadLicenceBack
};