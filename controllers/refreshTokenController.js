const AppError = require('../utils/appError');
const Token = require('../models/tokenModel');
const User = require('../models/userModel')

const jwt = require('jsonwebtoken');
const { createJWT } = require('../utils/jwt');

const handleRefreshToken = async (req, res, next) => {
  
  const rf = req?.body?.refreshToken;
  if (!rf) {
    return next(new AppError('Unauthorized', 401));
  }
  const refreshToken = rf;

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

  const user = await User.findById(foundToken.user)
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

      if (err || (foundToken.user).toString(16) !== decoded.id) {
        return next(new AppError('Please login again!', 403));
      }

      // refresh token was still valid

      const accessToken = createJWT(
        { id: foundToken.user },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRES_IN
      );

      const newRefreshToken = createJWT(
        { id: foundToken.user },
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXPIRES_IN
      );

      foundToken.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await foundToken.save();

      user.password = undefined;
      res.status(200).json({
        status: 'success',
        accessToken,
        refreshToken: newRefreshToken,
        user,
      });
    }
  );
};

module.exports = {
  handleRefreshToken,
};
