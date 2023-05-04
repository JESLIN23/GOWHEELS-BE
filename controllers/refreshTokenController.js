const AppError = require('../utils/appError');
const Token = require('../models/tokenModel');

const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    return next(new AppError('Unauthorized', 401));
  }
  const refreshToken = cookies.refreshToken;
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'None',
    secure: process.env.NODE_ENV === 'production',
  });

  const foundToken = await Token.findOne({ refreshToken }).exec();

  if (!foundToken) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return next(new AppError('Please login again!', 403));
        const hackedUser = await Token.findOne({ user: decoded.id }).exec();
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    );
    return next(new AppError('Please login again!', 403));
  }

  const newRefreshTokenArray = foundToken.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        foundToken.refreshToken = [...newRefreshTokenArray];
        await foundToken.save();
      }
      if (err || foundToken.user !== decoded.id) {
        return next(new AppError('Please login again!', 403));
      }

      // refresh token was still valid
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

      foundToken.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await foundToken.save();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        signed: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN),
      });

      res.status(200).json({
        status: 'success',
        accessToken,
      });
    }
  );
};

module.exports = {
  handleRefreshToken,
};
