const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const createJWT = (payload, secret, expiresIn) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

const isTokenValid = (token, secret) => jwt.verify(token, secret);

const sendJWTToken = async (res, foundToken, newRefreshTokenArray) => {
  const user = await User.findById( foundToken.user );

  const accessTokenJWT = createJWT(
    { id: foundToken.user, role: user.role } ,
    process.env.ACCESS_TOKEN_SECRET,
    process.env.ACCESS_TOKEN_EXPIRES_IN
  );
  const refreshTokenJWT = createJWT(
     { id: foundToken.user } ,
    process.env.REFRESH_TOKEN_SECRET,
    process.env.REFRESH_TOKEN_EXPIRES_IN
  );

  foundToken.refreshToken = [...newRefreshTokenArray, refreshTokenJWT];
  await foundToken.save();

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    accessToken: accessTokenJWT,
    refreshToken: refreshTokenJWT,
    user,
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  sendJWTToken,
};

