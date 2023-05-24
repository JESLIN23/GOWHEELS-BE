const otpGenerator = require('otp-generator');

const sendOTP = require('./sendOTP');

const sendNumberVerificationOTP = async ({ phone, user }) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const from = 'Gowheels Verification';
  const to = req.user.phone;
  const text = `${otp} is your verification code for Gowheels`;

  await sendOTP({
    from,
    to,
    text,
  });
};

module.exports = sendNumberVerificationOTP;
