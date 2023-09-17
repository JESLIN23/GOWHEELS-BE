"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var sharp = require('sharp');

var catchAsync = require('../utils/catchAsync');

var resizeCarImages = catchAsync(function _callee(req, res, next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (req.file) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          req.file.filename = "car-".concat(req.params.id, "-").concat(Date.now(), ".png");
          req.file.destination = "/uploads/images/car/";
          _context.next = 6;
          return regeneratorRuntime.awrap(sharp(req.file.buffer).resize(750, 400).toFile("uploads/images/car/".concat(req.file.filename)));

        case 6:
          next();

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});
var resizeUserImages = catchAsync(function _callee2(req, res, next) {
  var _req$files, avatar, licence_back, licence_front, data, avatar_file_destination, licence_file_destination, avatar_file_name, licence_front_file_name, licence_back_file_name;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$files = req.files, avatar = _req$files.avatar, licence_back = _req$files.licence_back, licence_front = _req$files.licence_front;

          if (!(!avatar && !licence_front && !licence_back)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next());

        case 3:
          data = _objectSpread({}, req.body);
          avatar_file_destination = 'uploads/images/avatar/';
          licence_file_destination = 'uploads/images/licence/';

          if (!avatar) {
            _context2.next = 11;
            break;
          }

          avatar_file_name = "avatar-".concat(req.user.id, "-").concat(Date.now(), ".jpeg");
          data.avatar = "".concat(process.env.BASE_URL, "/").concat(avatar_file_destination).concat(avatar_file_name);
          _context2.next = 11;
          return regeneratorRuntime.awrap(sharp(avatar[0].buffer).resize(400, 400).toFormat('jpeg').jpeg({
            quality: 90
          }).toFile("".concat(avatar_file_destination).concat(avatar_file_name)));

        case 11:
          if (!licence_front) {
            _context2.next = 16;
            break;
          }

          licence_front_file_name = "licence-front-".concat(req.user.id, "-").concat(Date.now(), ".jpeg");
          data.driving_licence = _objectSpread({}, data.driving_licence, {
            front_img: "".concat(process.env.BASE_URL, "/").concat(licence_file_destination).concat(licence_front_file_name)
          });
          _context2.next = 16;
          return regeneratorRuntime.awrap(sharp(licence_front[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({
            quality: 90
          }).toFile("".concat(licence_file_destination).concat(licence_front_file_name)));

        case 16:
          if (!licence_back) {
            _context2.next = 21;
            break;
          }

          licence_back_file_name = "licence-back-".concat(req.user.id, "-").concat(Date.now(), ".jpeg");
          data.driving_licence = _objectSpread({}, data.driving_licence, {
            back_img: "".concat(process.env.BASE_URL, "/").concat(licence_file_destination).concat(licence_back_file_name)
          });
          _context2.next = 21;
          return regeneratorRuntime.awrap(sharp(licence_back[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({
            quality: 90
          }).toFile("".concat(licence_file_destination).concat(licence_back_file_name)));

        case 21:
          req.body = _objectSpread({}, data);
          next();

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  });
});
var resizeLicenceImages = catchAsync(function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (req.file) {
            _context3.next = 2;
            break;
          }

          return _context3.abrupt("return", next());

        case 2:
          req.file.filename = "licence-".concat(req.params.id, "-").concat(Date.now(), ".jpeg");
          req.file.destination = "/uploads/images/licence/";
          _context3.next = 6;
          return regeneratorRuntime.awrap(sharp(req.file.buffer).toFormat('jpeg').jpeg({
            quality: 100
          }).toFile("uploads/images/licence/".concat(req.file.filename)));

        case 6:
          next();

        case 7:
        case "end":
          return _context3.stop();
      }
    }
  });
});
module.exports = {
  resizeUserImages: resizeUserImages,
  resizeCarImages: resizeCarImages,
  resizeLicenceImages: resizeLicenceImages
};