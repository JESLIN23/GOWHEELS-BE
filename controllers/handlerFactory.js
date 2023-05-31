const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document)
      return next(new AppError('No document found with that ID', 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
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

exports.getOne = (Model) =>
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

exports.getAll = (Model, option) =>
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
