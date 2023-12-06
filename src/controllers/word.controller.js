const { v4: uuid } = require('uuid');
const { Op } = require('sequelize');
const { promisify } = require('util');
const { User, Kata, sequelize } = require('../models');
const { getUserIdFromAccessToken } = require('../utils/jwt');
const { dataValid } = require('../validation/dataValidation');
const { bucket } = require('../middleware/multer');
const { sendMailUploadWordAdmin, sendMailAprovalWord, sendMailDeclineWord } = require('../utils/sendMail');

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

    const { id, name, role } = tokenInfo;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errors: ['User not found'],
        message: 'Set Word Failed',
        data: null,
      });
    }

    const word = await dataValid(valid, req.body);

    if (word.message.length > 0) {
      return res.status(400).json({
        errors: [word.message],
        message: 'Set Word Failed',
        data: null,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        errors: ['Audio file is not found'],
        message: 'Set Word Failed',
        data: null,
      });
    }

    const allowedAudioFormats = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!allowedAudioFormats.includes(req.file.mimetype)) {
      return res.status(400).json({
        errors: ['Only audio with extension .mp3, .wav, .mpeg is allowed'],
        message: 'Set Word Failed',
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
      message: 'Set Word Failed',
      data: null,
    }));

    let url;
    blobStream.on('finish', async () => {
      url = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(filePath)}?alt=media`;
    });

    const blobStreamEnd = promisify(blobStream.end).bind(blobStream);

    await blobStreamEnd(req.file.buffer);

    let result;
    if (role === 'admin') {
      result = await Kata.create(
        {
          ...word.data,
          userId: id,
          audioUrl: url,
          status: 'active',
        },
        {
          transaction,
        },
      );

      if (!result) {
        await transaction.rollback();
        return res.status(400).json({
          errors: ['Failed Save to Database'],
          message: 'Set Word Failed',
          data: null,
        });
      }

      await transaction.commit();

      return res.status(200).json({
        message: 'Success Set Word',
        data: result,
      });
    }

    result = await Kata.create(
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

    const dataKata = {
      name,
      kataId: result.id,
      sasak: result.sasak,
      indonesia: result.indonesia,
      contohPenggunaanSasak: result.contohPenggunaanSasak,
      contohPenggunaanIndo: result.contohPenggunaanIndo,
      audioUrl: result.audioUrl,
    };

    const emailSend = await sendMailUploadWordAdmin(dataKata);

    if (!emailSend) {
      await transaction.rollback();
      return res.status(400).json({
        errors: ['Email not sent'],
        message: 'Set Word Failed',
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

// eslint-disable-next-line consistent-return
const getAllWord = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const tokenInfo = getUserIdFromAccessToken(token);

    const { id, role } = tokenInfo;

    if (role !== 'admin') {
      return res.status(401).json({
        errors: ['Unauthorized, Admin only'],
        message: 'Get All Word Failed',
        data: null,
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errors: ['Admin not found'],
        message: 'Get All Word Failed',
        data: null,
      });
    }

    let result;
    if (req.query.status === 'pending') {
      result = await Kata.findAll(
        {
          attributes: [
            'id',
            'indonesia',
            'sasak',
            'audioUrl',
            'contohPenggunaanIndo',
            'contohPenggunaanSasak',
            'status',
            'createdAt',
            'userId',
          ],
          where: {
            status: req.query.status,
          },
        },
        {
          order: [['createdAt', 'DESC']],
        },
      );

      // Fetch user data for each word and replace userId with user object
      result = await Promise.all(
        result.map(async (data) => {
          const userData = await User.findByPk(data.userId);
          return {
            id: data.id,
            indonesia: data.indonesia,
            sasak: data.sasak,
            audioUrl: data.audioUrl,
            contohPenggunaanIndo: data.contohPenggunaanIndo,
            contohPenggunaanSasak: data.contohPenggunaanSasak,
            status: data.status,
            createdAt: data.createdAt,
            name: userData.name,
            avatarUrl: userData.avatarUrl,
          };
        }),
      );
    } else if (req.query.status === 'active') {
      result = await Kata.findAll(
        {
          where: {
            status: req.query.status,
          },
        },
        {
          attributes: [
            'id',
            'indonesia',
            'sasak',
            'audioUrl',
            'contohPenggunaanIndo',
            'contohPenggunaanSasak',
            'status',
            'createdAt',
            'userId',
          ],
          order: [['createdAt', 'DESC']],
        },
      );

      // Fetch user data for each word and replace userId with user object
      result = await Promise.all(
        result.map(async (data) => ({
          id: data.id,
          indonesia: data.indonesia,
          sasak: data.sasak,
          audioUrl: data.audioUrl,
          contohPenggunaanIndo: data.contohPenggunaanIndo,
          contohPenggunaanSasak: data.contohPenggunaanSasak,
          status: data.status,
          createdAt: data.createdAt,
        })),
      );
    }

    return res.status(200).json({
      errors: [],
      message: 'Get All Word Success',
      data: {
        result,
      },
    });
  } catch (error) {
    next(
      new Error(`controllers/word.controller.js:getAllWord - ${error.message}`),
    );
  }
};

// eslint-disable-next-line consistent-return
const approveWordAdmin = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const tokenInfo = getUserIdFromAccessToken(token);
    const { id, role } = tokenInfo;

    const kataId = req.params.id;

    if (role !== 'admin') {
      return res.status(401).json({
        errors: ['Unauthorized, Admin only'],
        message: 'Approve Word Failed',
        data: null,
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errors: ['Admin not found'],
        message: 'Approve Word Failed',
        data: null,
      });
    }

    const result = await Kata.update({
      status: 'active',
    }, {
      where: {
        id: kataId,
      },
      transaction,
    });

    if (!result) {
      await transaction.rollback();
      return res.status(404).json({
        errors: ['Word not found or already approved'],
        message: 'Approve Word failed',
        data: null,
      });
    }

    await transaction.commit();

    const kataData = await Kata.findOne({
      attributes: ['id', 'userId', 'sasak', 'indonesia', 'createdAt'],
      where: {
        id: kataId,
      },
    });

    const userData = await User.findOne({
      attributes: ['id', 'name', 'email'],
      where: {
        id: kataData.userId,
      },
    });

    const dataKata = {
      name: userData.name,
      kataId,
      sasak: kataData.sasak,
      indonesia: kataData.indonesia,
      createdAt: kataData.createdAt,
    };

    const sendMail = await sendMailAprovalWord(dataKata, userData.email);

    if (!sendMail) {
      return res.status(500).json({
        errors: ['Failed to send email'],
        message: 'Approve Word success, but failed to send email',
        data: null,
      });
    }

    return res.status(200).json({
      errors: [],
      message: 'Approve Word success',
      data: null,
    });
  } catch (error) {
    await transaction.rollback();
    next(
      new Error(`controllers/word.controller.js:approveWordAdmin - ${error.message}`),
    );
  }
};

// eslint-disable-next-line consistent-return
const declineWordAdmin = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const tokenInfo = getUserIdFromAccessToken(token);
    const { id, role } = tokenInfo;

    const kataId = req.params.id;

    if (role !== 'admin') {
      return res.status(401).json({
        errors: ['Unauthorized, Admin only'],
        message: 'Decline Word Failed',
        data: null,
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errors: ['Admin not found'],
        message: 'Decline Word Failed',
        data: null,
      });
    }

    const kataData = await Kata.findOne({
      where: {
        id: kataId,
      },
    });

    if (!kataData) {
      return res.status(404).json({
        errors: ['Word not found'],
        message: 'Decline Word Failed',
        data: null,
      });
    }

    const userData = await User.findOne({
      attributes: ['id', 'name', 'email'],
      where: {
        id: kataData.userId,
      },
    });

    const dataKata = {
      name: userData.name,
      kataId,
      sasak: kataData.sasak,
      indonesia: kataData.indonesia,
      contohPenggunaanSasak: kataData.contohPenggunaanSasak,
      contohPenggunaanIndo: kataData.contohPenggunaanIndonesia,
      audioUrl: kataData.audioUrl,
      createdAt: kataData.createdAt,
    };

    const result = await Kata.destroy({
      where: {
        id: kataId,
        status: 'pending',
      },
      transaction,
    });

    if (!result) {
      await transaction.rollback();
      return res.status(404).json({
        errors: ['Word not found or status is active'],
        message: 'Declined kata failed',
        data: null,
      });
    }

    const sendMail = await sendMailDeclineWord(dataKata, userData.email);

    if (!sendMail) {
      await transaction.rollback();
      return res.status(500).json({
        errors: ['Failed to send email'],
        message: 'Approve Word success, but failed to send email',
        data: null,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      errors: [],
      message: 'Decline word success',
      data: null,
    });
  } catch (error) {
    await transaction.rollback();
    next(
      new Error(`controllers/word.controller.js:declineWordAdmin - ${error.message}`),
    );
  }
};

// eslint-disable-next-line consistent-return
const translateWord = async (req, res, next) => {
  try {
    const word = req.query.search;
    const indo = req.query.indonesia;

    if (!indo) {
      return res.status(400).json({
        errors: ['Set from language is required'],
        message: 'Translate Word Failed',
        data: null,
      });
    }

    let result;
    if (indo === 'true') {
      result = await Kata.findAll({
        attributes: ['sasak', 'indonesia', 'contohPenggunaanSasak', 'contohPenggunaanIndo', 'audioUrl'],
        where: {
          indonesia: {
            [Op.like]: `%${word}%`,
          },
        },
        limit: 10,
      });
    } else if (indo === 'false') {
      result = await Kata.findAll({
        attributes: ['indonesia', 'sasak', 'contohPenggunaanSasak', 'contohPenggunaanIndo', 'audioUrl'],
        where: {
          sasak: {
            [Op.like]: `%${word}%`,
          },
        },
        limit: 10,
      });
    }

    if (!result) {
      return res.status(404).json({
        errors: ['Word not found'],
        message: 'Translate Word Failed',
        data: null,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        errors: ['Word not found in database'],
        message: 'Translate Word Success',
        data: null,
      });
    }

    return res.status(200).json({
      errors: [],
      message: 'Translate Word Success',
      data: result,
    });
  } catch (error) {
    next(
      new Error(`controllers/word.controller.js:translateWord - ${error.message}`),
    );
  }
};

// eslint-disable-next-line consistent-return
const deleteWord = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const tokenInfo = getUserIdFromAccessToken(token);

    const userIdGet = tokenInfo.id;

    const result = await Kata.destroy({
      where: {
        id: req.params.id,
        userId: userIdGet,
      },
      transaction,
    });

    if (!result) {
      await transaction.rollback();
      return res.status(404).json({
        errors: ['Word not found'],
        message: 'Delete Word Failed',
        data: null,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      errors: [],
      message: 'Delete Word Success',
      data: null,
    });
  } catch (error) {
    await transaction.rollback();
    next(
      new Error(`controllers/word.controller.js:deleteWord - ${error.message}`),
    );
  }
};

module.exports = {
  setWord,
  getAllWord,
  approveWordAdmin,
  declineWordAdmin,
  deleteWord,
  translateWord,
};
