const { promisify } = require('util');
const crypto = require('crypto');

const Token = require('../models/tokenModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/sendEmail');
const sendVerificationEmail = require('../utils/sendVerificationEmail');

exports.signup = catchAsync(async (req, res, next) => {
  const emailVerificationToken = crypto.randomBytes(40).toString('hex');

  const newUser = await User.create({
    firstName: req.body.firstName,
    secondName: req.body.secondName,
    email: req.body.email,
    gender: req.body.gender,
    date_of_birth: req.body.date_of_birth,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
    emailVerificationToken,
  });

  await sendVerificationEmail({
    name: newUser.name,
    email: newUser.email,
    emailVerificationToken: newUser.emailVerificationToken,
    weburl: process.env.WEBURL,
  });

  res.status(201).json({
    message: 'Success! Please check your email to verify account',
  });

});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { emailVerificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('Verification faild', 401));
  }

  if (user.emailVerificationToken !== emailVerificationToken) {
    return next(new AppError('Verification faild', 401));
  }

  user.isEmailVerified = true;
  user.isEmailVerifiedAt = Date.now();
  user.emailVerificationToken = '';

  await user.save();

  const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  if (cookies?.refreshToken)
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
    });

  await Token.create({ refreshToken, user: user._id });

  res.cookies('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: 'None',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  res.status(200).json({
    status: 'success',
    accessToken,
    user: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!isEmailVerified) {
    return next(new AppError('Please verify your email', 401));
  }

  const foundToken = await Token.findOne({ user: user._id });

  const accessToken = jwt.sign(
    { id: foundToken.user },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const newRefreshToken = jwt.sign(
    { id: foundToken.user },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  const newRefreshTokenArray = !cookies?.refreshToken
    ? foundToken.refreshToken
    : foundToken.refreshToken.filter((rt) => rt !== cookies.refreshToken);

  if (cookies?.refreshToken)
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
    });

  foundToken.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await foundToken.save();

  res.cookies('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: 'None',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  res.status(200).json({
    status: 'success',
    accessToken,
    user: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)get user based on POSTed email
  const email = req.body.email;
  if (!email) {
    return next(new AppError('Please provide email.', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //2)gen random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //when creating the token document was not saved, it is now.

  //3)send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a request with new password
   and passWord confirm to ${resetURL}. \n If no, then ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset Token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError('Token is invalid or has expired. Please try again', 400)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Please login again!',
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong!', 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Please login again!',
  });
});

exports.handleLogout = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return next(new AppError('Please login again', 204));
  }
  const refreshToken = cookies.jwt;

  const foundToken = await Token.findOne({ refreshToken }).exec();

  if (!foundToken) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(204).json({
      status: 'success',
      message: 'Logout successfully',
    });
  }

  //delete RF in db

  foundToken.refreshToken = foundToken.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  await foundToken.save();

  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'None',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(204).json({
    status: 'success',
    message: 'Logout successfully',
  });
});
