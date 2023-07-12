const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const path = require('path');
const fs = require('fs');

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (document.images.length) {
      let image = document.images || [];
      const currentDirectory = __dirname;
      const parentDirectory = path.dirname(currentDirectory);
      image.forEach((img) => {
        let imgUrl = img.url.split('/');
        let imageName = imgUrl[imgUrl.length - 1];
        const imagePath = path.join(
          parentDirectory,
          'uploads',
          'images',
          'car',
          imageName
        );
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (err) {
              return next(new AppError('Image not found'), 404);
            }
          });
        } else {
          return next(new AppError('Path not found'), 400);
        }
      });
    }

    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

const getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let document = await Model.findById(req.params.id);
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

const getAll = (Model, option) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(option), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
      
    const values = await features.query;
    let document = values.map((doc, index) => {
      const data = doc.toObject();
      return { ...data, no: index + 1 };
    });

    res.status(200).json({
      status: 'success',
      results: document.length,
      data: {
        document,
      },
    });
  });

module.exports = {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll,
};
