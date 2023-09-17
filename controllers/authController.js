const crypto = require('crypto');

const Token = require('../models/tokenModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const OTP = require('../models/otpModel');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/sendEmail');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const sendNumberVerificationOTP = require('../utils/sendNumberVerificationOTP');
const { sendJWTToken, createJWT } = require('../utils/jwt');

const signup = catchAsync(async (req, res, next) => {
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
  });

  const accessTokenJWT = createJWT(
    { id: newUser._id, role: newUser.role },
    process.env.ACCESS_TOKEN_SECRET,
    process.env.ACCESS_TOKEN_EXPIRES_IN
  );
  const refreshTokenJWT = createJWT(
    { id: newUser._id },
    process.env.REFRESH_TOKEN_SECRET,
    process.env.REFRESH_TOKEN_EXPIRES_IN
  );

  await Token.create({ refreshToken: refreshTokenJWT, user: newUser._id });

  newUser.password = undefined;

  const url =  `${req.protocol}://${process.env.WEB_URL}`;
  await new Email(newUser, url).sendWelcome();

  res.status(201).json({
    status: 'success',
    accessToken: accessTokenJWT,
    refreshToken: refreshTokenJWT,
    user: newUser,
    message: 'Account created',
  });
});

const sendVerificationOTP = catchAsync(async (req, res, next) => {
  const user = req.user;

  await sendNumberVerificationOTP({
    phone: user.phone,
    user: user._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'Verification OTP send to your phone number',
  });
});

const sendEmailVerification = catchAsync(async (req, res, next) => {
  const user = req.user;
  const emailVerificationToken = crypto.randomBytes(40).toString('hex');

  const emailUser = await User.findById(user._id);

  emailUser.emailVerificationToken = emailVerificationToken;
  await emailUser.save();

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    emailVerificationToken,
    weburl: process.env.WEBURL,
  });

  res.status(200).json({
    status: 'success',
    message: 'Verification message send to your email',
  });
});

const verifyPhone = catchAsync(async (req, res, next) => {
  const otp = req?.body?.otp;
  if (!otp) return next(new AppError('Please provide OTP', 400));

  const otpUser = await OTP.findOne({ user: req.user._id });
  if (!otpUser) {
    return next(new AppError('OTP expired! Please try again.', 404));
  }

  if (otpUser.otp !== otp) {
    return next(new AppError('OTP is incorrect!', 400));
  }

  const user = await User.findById(otpUser.user);
  user.isPhoneVerified = true;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Phone number verified',
  });
});

const verifyEmail = catchAsync(async (req, res, next) => {
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

  res.status(200).json({
    status: 'success',
    message: 'email is verified',
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const foundToken = await Token.findOne({ user: user._id });

  let newRefreshTokenArray = !req.body.refreshToken
    ? foundToken?.refreshToken
    : foundToken?.refreshToken.filter((rt) => rt !== refreshToken);

  sendJWTToken(res, foundToken, newRefreshTokenArray);
});

const loginAdmin = catchAsync(async (req, res, next) => {
  const { email, password, refreshToken } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user?.role !== 'admin') {
    return next(new AppError('Incorrect email or password', 401));
  }

  const foundToken = await Token.findOne({ user: user._id });

  let newRefreshTokenArray = !refreshToken
    ? foundToken.refreshToken
    : foundToken.refreshToken.filter((rt) => rt !== refreshToken);

  sendJWTToken(res, foundToken, newRefreshTokenArray);
});

const forgotPassword = catchAsync(async (req, res, next) => {
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
  const resetURL = `${req.protocol}://${process.env.WEB_URL}/reset-password/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset()

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

const resetPassword = catchAsync(async (req, res, next) => {
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

const updatePassword = catchAsync(async (req, res, next) => {
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

const logout = catchAsync(async (req, res, next) => {
  const rt = req?.body?.refreshToken;

  if (!rt) {
    return next(new AppError('Please login again.', 401));
  }
  const refreshToken = rt;

  const foundToken = await Token.findOne({ refreshToken }).exec();
  if (!foundToken) {
    res.status(200).json({
      status: 'success',
      message: 'Logout successfully',
    });
  }

  //delete RT in db

  foundToken.refreshToken = foundToken.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  await foundToken.save();

  res.status(200).json({
    status: 'success',
    message: 'Logout successfully',
  });
});

const userProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  signup,
  verifyEmail,
  login,
  logout,
  updatePassword,
  resetPassword,
  forgotPassword,
  verifyPhone,
  sendVerificationOTP,
  sendEmailVerification,
  userProfile,
  loginAdmin,
};
