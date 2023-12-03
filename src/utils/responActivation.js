const userNotFoundHtml = `
  <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 50px auto;">
    <h2 style="color: #8F8F8F;">Activate User Failed</h2>
    <p style="color: #B4B4B4;">User not found or expired</p>
  </div>
`;

const userActivatedHtml = (userName, userEmail) => `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 50px auto;">
        <h2 style="color: #D61F3B;">User activated successfully</h2>
        <h4 style="color: #D61F3B;">Welcome to Kasa Talk</h4>
        <p>Dear ${userName},</p>
        <p>Your account has been successfully activated.</p>
        <p>Name: ${userName}</p>
        <p>Email: ${userEmail}</p>
    </div>
`;

module.exports = {
  userNotFoundHtml,
  userActivatedHtml,
};
