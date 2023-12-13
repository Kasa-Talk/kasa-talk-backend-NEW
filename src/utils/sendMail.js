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
        <h2 style="color: #D61F3B;">Password Reset Confirmation</h2>
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

const createUploadWordAdmin = (kataDetails) => {
  const {
    name, kataId, sasak, indonesia, audioUrl, contohPenggunaanIndo, contohPenggunaanSasak,
  } = kataDetails;
  return {
    from: process.env.MAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Word Upload - Review Required',
    html: `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #D61F3B;">New Word Upload - Review Required</h2>
            <p>Hello Admin,</p>
            
            <p><strong>${name}</strong> has uploaded a new word that requires your review. Please review the details below:</p>
            
            <ul>
              <li><strong>Kata ID:</strong> ${kataId}</li>
              <li><strong>Sasak:</strong> ${sasak}</li>
              <li><strong>Indonesia:</strong> ${indonesia}</li>
              <li><strong>Contoh Penggunaan Indo:</strong> ${contohPenggunaanIndo}</li>
              <li><strong>Contoh Penggunaan Sasak:</strong> ${contohPenggunaanSasak}</li>
              <li><strong>Audio URL:</strong> ${audioUrl}</li>
            </ul>
    
            <p style="margin-top: 20px;">Thank you for your attention. If you have any questions or need assistance, feel free to contact us.</p>
    
            <p style="margin-top: 40px; color: #888;">Best Regards,<br>Kasa Talk</p>
          </div>
        `,
  };
};

const createApprovalEmail = (kataDetails, email) => {
  const {
    name, kataId, sasak, indonesia, createdAt,
  } = kataDetails;
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Word Upload Approved - Confirmation',
    html: `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #D61F3B;">Word Upload Approved</h2>
            <p>Hello ${name},</p>
            
            <p>We are pleased to inform you that your uploaded word has been approved by the admin. Here are the details:</p>
            
            <ul>
              <li><strong>Kata ID:</strong> ${kataId}</li>
              <li><strong>Sasak:</strong> ${sasak}</li>
              <li><strong>Indonesia:</strong> ${indonesia}</li>
              <li><strong>Upload Date:</strong> ${createdAt}</li>
            </ul>

            <p style="margin-top: 20px;">Thank you for contributing to our community. If you have any further questions or need assistance, feel free to contact us.</p>
    
            <p style="margin-top: 40px; color: #888;">Best Regards,<br>Kasa Talk</p>
          </div>
        `,
  };
};

const createDeclineEmail = (kataDetails, email) => {
  const {
    name,
    kataId,
    sasak,
    indonesia,
    contohPenggunaanIndo, contohPenggunaanSasak, audioUrl, createdAt,
  } = kataDetails;
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Word Upload Declined - Action Required',
    html: `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #D61F3B;">Word Upload Declined</h2>
            <p>Hello ${name},</p>
            
            <p>We regret to inform you that your uploaded word has been declined by the admin. Here are the details:</p>
            
            <ul>
              <li><strong>Kata ID:</strong> ${kataId}</li>
              <li><strong>Sasak:</strong> ${sasak}</li>
              <li><strong>Indonesia:</strong> ${indonesia}</li>
              <li><strong>Contoh Penggunaan Sasak:</strong> ${contohPenggunaanSasak}</li>
              <li><strong>Contoh Penggunaan Indo:</strong> ${contohPenggunaanIndo}</li>
              <li><strong>Audio URL:</strong> ${audioUrl}</li>
              <li><strong>Upload Date:</strong> ${createdAt}</li>
            </ul>
            
            <p>You have the opportunity to make corrections and re-upload the word. We encourage you to review the details and ensure accurate information before re-submitting.</p>
    
            <p style="margin-top: 20px;">If you have any questions or need assistance in making corrections, feel free to contact us.</p>
    
            <p style="margin-top: 40px; color: #888;">Best Regards,<br>Kasa Talk</p>
          </div>
        `,
  };
};

const createMessage = (email, name, subject, message) => ({
  from: email,
  to: process.env.MAIL_USER,
  subject: `${subject} - Kasa Talk`,
  html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D61F3B;">${subject}</h2>
        <p>Hi admin, you have a new message from <strong>${name}</strong> <i>(${email})</i></p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <table style="width: 100%;">
            <tr>
              <td>${message}</td>
            </tr>
          </table>
        </div>

        <p style="margin-top: 20px;">If you have any questions or need assistance, feel free to contact us.</p>

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

const sendMailUploadWordAdmin = (kataDetails) => new Promise((resolve, reject) => {
  transporter.sendMail(createUploadWordAdmin(kataDetails), (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
      reject(err);
    } else {
      console.log(`Email sent (sendMail): ${info.response}`);
      resolve(true);
    }
  });
});

const sendMailAprovalWord = (kataDetails, email) => new Promise((resolve, reject) => {
  transporter.sendMail(createApprovalEmail(kataDetails, email), (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
      reject(err);
    } else {
      console.log(`Email sent (sendMail): ${info.response}`);
      resolve(true);
    }
  });
});

const sendMailDeclineWord = (kataDetails, email) => new Promise((resolve, reject) => {
  transporter.sendMail(createDeclineEmail(kataDetails, email), (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
      reject(err);
    } else {
      console.log(`Email sent (sendMail): ${info.response}`);
      resolve(true);
    }
  });
});

const sendMailMessage = (email, name, subject, message) => new Promise((resolve, reject) => {
  transporter.sendMail(createMessage(email, name, subject, message), (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
      reject(err);
    } else {
      console.log(`Email sent (sendMail): ${info.response}`);
      resolve(true);
    }
  });
});

module.exports = {
  sendMail,
  sendPassword,
  sendMailUploadWordAdmin,
  sendMailAprovalWord,
  sendMailDeclineWord,
  sendMailMessage,
};
