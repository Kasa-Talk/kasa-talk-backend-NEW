const jsonWebToken = require('jsonwebtoken');
require('dotenv').config();

console.log(process.env.JWT_SECRET);

const generateAccessToken = (user) => jsonWebToken.sign(user, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
});

const generateRefreshToken = (user) => jsonWebToken.sign(user, process.env.JWT_REFRESH_SECRET, {
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '86400s',
});

const verifyRefreshToken = (token) => {
  try {
    return jsonWebToken.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

const parseJWT = (token) => JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

const verifyAccessToken = (token) => {
  try {
    return jsonWebToken.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // eslint-disable-next-line no-unused-expressions
    return null;
  }
};

const getUserIdFromAccessToken = (token) => {
  try {
    const decodedToken = jsonWebToken.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseJWT,
  verifyAccessToken,
  getUserIdFromAccessToken,
};
