const sendEmail = require('./sendEmail');

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  weburl,
}) => {
  const verifyEmail = `${weburl}/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link: <a href="${verifyEmail}">Verify Email</a></p>`;
  await sendEmail({
    to: email,
    subject: 'Email Confirmation',
    html: `<h4>Hello, ${name}</h4>
        ${message}`,
  });
};

module.exports = sendVerificationEmail;
