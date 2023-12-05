const multer = require('multer');
const admin = require('../config/firebase.config');

const bucket = admin.storage().bucket();

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = { upload, bucket };
