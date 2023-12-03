const nodemailer = require('nodemailer');
require('dotenv').config();

const baseUrl = process.env.BASE_URL;

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const createEmail = (email, token) => ({
  from: process.env.MAIL_FROM,
  to: email,
  subject: 'Account Activation - Confirmation',
  html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D61F3B;">Account Activation</h2>
          <p>Welcome to Kasa Talk! To activate your account, please click the link below:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <a href="${baseUrl}/api/users/activate/${token}" style="display: inline-block; padding: 10px 20px; background-color: #D61F3B; color: #ffffff; text-decoration: none; border-radius: 3px;">Activate Your Account</a>
          </div>
  
          <p style="margin-top: 20px;">If the button above does not work, you can also activate your account by copying and pasting the following link into your browser:</p>
  
          <p>${baseUrl}/api/users/activate/${token}</p>
  
          <p style="margin-top: 20px;">Thank you for joining our community. If you have any questions or need assistance, feel free to contact us.</p>
  
          <p style="margin-top: 40px; color: #888;">Best Regards,<br>Kasa Talk</p>
        </div>
      `,
});

const forgotPassword = (email, password) => ({
  from: process.env.MAIL_FROM,
  to: email,
  subject: 'Password Reset Confirmation',
  html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #32823A;">Password Reset Confirmation</h2>
        <p>We received a request to reset your account password. Below are your new login details:</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 30%;"><strong>Email:</strong></td>
              <td>${email}</td>
            </tr>
            <tr>
              <td style="width: 30%;"><strong>New Password:</strong></td>
              <td>${password}</td>
            </tr>
          </table>
        </div>

        <p style="margin-top: 20px;">For security reasons, we recommend changing your password after logging in. If you didn't request a password reset, please contact us immediately.</p>

        <p style="margin-top: 20px;">Thank you for using our service. If you have any questions or need further assistance, feel free to contact us.</p>

        <p style="margin-top: 40px; color: #888;">Best Regards,<br>Kasa Talk</p>
      </div>
    `,
});

const sendMail = (email, token) => new Promise((resolve, reject) => {
  transporter.sendMail(createEmail(email, token), (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
      reject(err);
    } else {
      console.log(`Email sent (sendMail): ${info.response}`);
      resolve(true);
    }
  });
});

const sendPassword = (email, password) => new Promise((resolve, reject) => {
  transporter.sendMail(forgotPassword(email, password), (err, info) => {
    if (err) {
      console.log(err);
      reject(err);
    } else {
      console.log(`Email sent (sendPassword): ${info.response}`);
      resolve(true);
    }
  });
});

module.exports = {
  sendMail,
  sendPassword,
};
