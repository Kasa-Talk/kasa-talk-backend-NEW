const logger = require('../middleware/winston');
const { verifyAccessToken } = require('../utils/jwt');

// eslint-disable-next-line no-unused-vars
const errorrHandling = (err, req, res, next) => {
  const message = err.message.split(' - ')[1];
  logger.error(err);
  res.status(500).json({
    errors: [message],
    message: 'Internal Server Error',
    data: null,
  });
};

// eslint-disable-next-line consistent-return
const autenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      errors: ['Token not found'],
      message: 'Verify Failed',
      data: null,
    });
  }

  const user = verifyAccessToken(token);

  if (!user) {
    return res.status(401).json({
      errors: ['Invalid token'],
      message: 'Verify Failed',
      data: null,
    });
  }

  req.user = user;

  if (req.url.includes('/admin')) {
    if (user.role !== 'admin') {
      return res.status(403).json({
        errors: ['Unauthorized access'],
        message: 'Access Denied, Only Admin',
        data: null,
      });
    }
  }

  next();
};

module.exports = { errorrHandling, autenticate };
