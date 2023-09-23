const { Vonage } = require('@vonage/server-sdk');

const sendOTP = async ({ from, to, text }) => {
  const vonage = new Vonage({
    apiKey: process.env.VONAGE_APIKEY,
    apiSecret: process.env.VONAGE_APISECRET,
  });

  await vonage.sms.send({ to, from, text })
    
};

module.exports = sendOTP;
