const jwt = require('jsonwebtoken');
const Token = require('../models/tokenModel');
const User = require('../models/userModel')

const createJWT = ({ payload, secret, expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

const isTokenValid = (token, secret) => jwt.verify(token, secret);

const sendJWTToken = async (res, user, statusCode) => {
  const accessTokenJWT = createJWT(
    { payload: { id: user._id } },
    process.env.ACCESS_TOKEN_SECRET,
    process.env.ACCESS_TOKEN_EXPIRES_IN
  );
  const refreshTokenJWT = createJWT(
    { payload: { id: user._id } },
    process.env.REFRESH_TOKEN_SECRET,
    process.env.REFRESH_TOKEN_EXPIRES_IN
  );

  // const oneDay = 1000 * 60 * 60 * 24;
  const longerExp = 1000 * 60 * 60 * 24 * 7;

  const tokenUser = await Token.findById({ user: user.user });
  tokenUser.refreshToken = [...tokenUser.refreshToken, refreshTokenJWT];
  await tokenUser.save();

  const users = await User.findById({ _id: user.user })

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: 'None',
    expires: new Date(Date.now() + longerExp),
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    accessToken: accessTokenJWT,
    data: {
      users,
    },
  });
};

// const sendJWTToken = ( res, user, statusCode ) => {
//   const accessTokenJWT = createJWT({ payload: { id: user._id } }, process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_EXPIRES_IN);
//   const refreshTokenJWT = createJWT({ payload: { id: user._id } }, process.env.REFRESH_TOKEN_SECRET, process.env.REFRESH_TOKEN_EXPIRES_IN);

//   // const oneDay = 1000 * 60 * 60 * 24;
//   const longerExp = 1000 * 60 * 60 * 24 * 7;

//   // res.cookie('accessToken', accessTokenJWT, {
//   //   httpOnly: true,
//   //   secure: process.env.NODE_ENV === 'production',
//   //   signed: true,
//   //   sameSite: 'None',
//   //   expires: new Date(Date.now() + oneDay),
//   // });

//   await Token.findById({ id: user._id })

//   res.cookie('refreshToken', refreshTokenJWT, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     signed: true,
//     sameSite: 'None',
//     expires: new Date(Date.now() + longerExp),
//   });

//   user.password = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     accessToken: accessTokenJWT,
//     data: {
//       user,
//     },
//   });
// };

module.exports = {
  createJWT,
  isTokenValid,
  sendJWTToken,
};
