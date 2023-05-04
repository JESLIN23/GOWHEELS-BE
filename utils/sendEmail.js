const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig')

const sendEmail = async ({to, subject, html}) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);
  //2) define email options
  const mailOptions = {
    from: 'GOWheels <jeslinmusthafa23@gmail.com>',
    to,
    subject,
    html,
  };

  //3) send email with nomailer

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;


