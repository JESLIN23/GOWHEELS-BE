const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) create transporter, service that will send the email
//   const transporter = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "dcbe069c8256ac",
//       pass: "9c6a9a341cfcb9"
//     }
//   });
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) define email options
  const mailOptions = {
    from: 'GOWheels <jeslinmusthafa23@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) send email with nomailer

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
