const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');

const resizeCarImages = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `car-${req.params.id}-${Date.now()}.png`;
  req.file.destination = `/uploads/images/car/`;

  await sharp(req.file.buffer)
    .resize(750, 400)
    .toFile(`uploads/images/car/${req.file.filename}`);

  next();
});

const resizeUserImages = catchAsync(async (req, res, next) => {
  const { avatar, licence_back, licence_front } = req.files;
  if (!avatar && !licence_front && !licence_back) {
    return next();
  }

  const data = { ...req.body };

  const avatar_file_destination = 'uploads/images/avatar/';
  const licence_file_destination = 'uploads/images/licence/';

  if (avatar) {
    const avatar_file_name = `avatar-${req.user.id}-${Date.now()}.jpeg`;
    data.avatar = `${process.env.BASE_URL}/${avatar_file_destination}${avatar_file_name}`;
    await sharp(avatar[0].buffer)
      .resize(400, 400)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`${avatar_file_destination}${avatar_file_name}`);
  }

  if (licence_front) {
    const licence_front_file_name = `licence-front-${
      req.user.id
    }-${Date.now()}.jpeg`;
    data.driving_licence = {
      ...data.driving_licence,
      front_img: `${process.env.BASE_URL}/${licence_file_destination}${licence_front_file_name}`,
    };
    await sharp(licence_front[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`${licence_file_destination}${licence_front_file_name}`);
  }

  if (licence_back) {
    const licence_back_file_name = `licence-back-${
      req.user.id
    }-${Date.now()}.jpeg`;
    data.driving_licence = {
      ...data.driving_licence,
      back_img: `${process.env.BASE_URL}/${licence_file_destination}${licence_back_file_name}`,
    };

    await sharp(licence_back[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`${licence_file_destination}${licence_back_file_name}`);
  }

  req.body = { ...data };

  next();
});

const resizeLicenceImages = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `licence-${req.params.id}-${Date.now()}.jpeg`;
  req.file.destination = `/uploads/images/licence/`;

  await sharp(req.file.buffer)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`uploads/images/licence/${req.file.filename}`);

  next();
});

module.exports = { resizeUserImages, resizeCarImages, resizeLicenceImages };
