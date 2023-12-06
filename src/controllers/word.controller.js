const { v4: uuid } = require('uuid');
const { promisify } = require('util');
const { User, Kata, sequelize } = require('../models');
const { getUserIdFromAccessToken } = require('../utils/jwt');
const { dataValid } = require('../validation/dataValidation');
const { bucket } = require('../middleware/multer');

// eslint-disable-next-line consistent-return
const setWord = async (req, res, next) => {
  const valid = {
    indonesia: 'required',
    sasak: 'required',
    contohPenggunaanIndo: 'required',
    contohPenggunaanSasak: 'required',
  };
  const transaction = await sequelize.transaction();
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const tokenInfo = getUserIdFromAccessToken(token);

    const { id } = tokenInfo;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errors: ['Pengguna tidak ditemukan'],
        message: 'Gagal Set Word',
        data: null,
      });
    }

    const word = await dataValid(valid, req.body);

    if (word.message.length > 0) {
      return res.status(400).json({
        errors: [word.message],
        message: 'Gagal Set Word',
        data: null,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        errors: ['File audio tidak ditemukan'],
        message: 'Gagal Set Word',
        data: null,
      });
    }

    const allowedAudioFormats = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!allowedAudioFormats.includes(req.file.mimetype)) {
      return res.status(400).json({
        errors: ['Format file salah. Hanya MP3, WAV, and MPEG yang diizinkan.'],
        message: ' Gagal Set Word',
        data: null,
      });
    }

    const folderName = 'audio';
    const fileName = `${uuid()}-${req.file.originalname}`;
    const filePath = `${folderName}/${fileName}`;

    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: uuid(),
      },
      contentType: req.file.mimetype,
      cacheControl: 'public, max-age=31536000',
    };

    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
      metadata,
      gzip: true,
    });

    blobStream.on('error', (error) => res.status(500).json({
      errors: [error.message],
      message: ' Gagal Set Word',
      data: null,
    }));

    let url;
    blobStream.on('finish', async () => {
      url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    });

    const blobStreamEnd = promisify(blobStream.end).bind(blobStream);

    await blobStreamEnd(req.file.buffer);

    const result = await Kata.create(
      {
        ...word.data,
        userId: id,
        audioUrl: url,
      },
      {
        transaction,
      },
    );

    if (!result) {
      await transaction.rollback();
      return res.status(400).json({
        errors: ['Gagal simpan di database'],
        message: 'Gagal Set Word',
        data: null,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      message: 'Sukses Set Word',
      data: result,
    });
  } catch (error) {
    await transaction.rollback();
    next(
      new Error(`controllers/word.controller.js:setWord - ${error.message}`),
    );
  }
};

module.exports = {
  setWord,
};
