const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const nodemailerConfig = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

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
