const sharp = require('sharp');

const resizeCarImages = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `car-${req.params.id}-${Date.now()}.png`;
  req.file.destination = `/uploads/images/car/`;

  sharp(req.file.buffer)
    .resize(750, 400)
    .toFile(`uploads/images/car/${req.file.filename}`);

  next();
};

const resizeUserImages = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.params.id}-${Date.now()}.jpeg`;
  req.file.destination = `/uploads/images/avatar/`;

  sharp(req.file.buffer)
    .resize(400, 400)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/images/avatar/${req.file.filename}`);

  next();
};

module.exports = { resizeUserImages, resizeCarImages };
