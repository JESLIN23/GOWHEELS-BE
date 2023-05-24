const jwt = require('jsonwebtoken');
// const Token = require('../models/tokenModel');
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

  // const tokenUser = await Token.findById({ user: foundToken.user });
  foundToken.refreshToken = [...newRefreshTokenArray, refreshTokenJWT];
  await foundToken.save();

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    domain: ".localhost",
    path: "/",
    expires: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * process.env.JWT_COOKIES_EXPIRES_IN
    ),
  });

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    accessToken: accessTokenJWT,
    role: user.role
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  sendJWTToken,
};

