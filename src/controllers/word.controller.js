const { Op } = require('sequelize');
const { User, Kata, sequelize } = require('../models');
const { getUserIdFromAccessToken } = require('../utils/jwt');
const { dataValid } = require('../validation/dataValidation');
const { sendMailAprovalWord, sendMailDeclineWord, sendMailUploadWordAdmin } = require('../utils/sendMail');
require('dotenv').config();

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

    const { id, role } = tokenInfo;

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

    let result;
    if (role === 'admin') {
      result = await Kata.create(
        {
          ...word.data,
          audioUrl: req.body.audioUrl,
          userId: id,
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
        audioUrl: req.body.audioUrl,
        userId: id,
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

    const mailToAdmin = await sendMailUploadWordAdmin({
      name: user.name,
      kataId: result.id,
      indonesia: result.indonesia,
      sasak: result.sasak,
      contohPenggunaanIndo: result.contohPenggunaanIndo,
      contohPenggunaanSasak: result.contohPenggunaanSasak,
      audioUrl: result.audioUrl,
    });

    if (!mailToAdmin) {
      await transaction.rollback();
      return res.status(400).json({
        errors: ['Failed Send Email'],
        message: 'Success Set Word but Failed Send Email',
        data: null,
      });
    }

    return res.status(200).json({
      message: 'Success Set Word',
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

      const mappedResult = await Promise.all(result.map(async (data) => {
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
          name: userData ? userData.name : null,
          avatarUrl: userData ? userData.avatarUrl : null,
        };
      }));

      return res.status(200).json({
        errors: [],
        message: 'Get All Word Success',
        data: mappedResult,
      });
    } if (req.query.status === 'active') {
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
      contohPenggunaanIndo: kataData.contohPenggunaanIndo,
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
const getAllUserWord = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const tokenInfo = getUserIdFromAccessToken(token);
    const { id } = tokenInfo;

    const kataUser = await Kata.findAll({
      attributes: ['id', 'sasak', 'indonesia', 'contohPenggunaanSasak', 'contohPenggunaanIndo', 'audioUrl', 'status', 'createdAt'],
      where: {
        userId: id,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!kataUser) {
      return res.status(404).json({
        errors: ['User not have word'],
        message: 'Get User Word Failed',
        data: null,
      });
    }

    return res.status(200).json({
      errors: [],
      message: 'Get User Word Success',
      data: kataUser,
    });
  } catch (error) {
    next(
      new Error(`controllers/word.controller.js:getAllUserWord - ${error.message}`),
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
          status: 'active',
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
          status: 'active',
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

// eslint-disable-next-line consistent-return
const deleteWordAdmin = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await Kata.destroy({
      where: {
        id: req.params.id,
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

// eslint-disable-next-line consistent-return
const getTopContributor = async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const kataContributor = await Kata.findAll({
      attributes: ['userId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
      where: {
        status: 'active',
      },
      group: ['userId'],
    });

    const contributor = await User.findAll({
      attributes: ['id', 'name', 'email', 'avatarUrl'],
      where: {
        id: {
          [Op.in]: kataContributor.map((kata) => kata.userId),
        },
        email: {
          [Op.ne]: process.env.ADMIN_EMAIL,
        },
      },
    });

    const formattedContributor = contributor
      .map((user) => ({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        total: `${kataContributor.find((kata) => kata.userId === user.id).get('count')} kata`,
      }))
      .sort((a, b) => {
        const countA = parseInt(a.total.split(' ')[0], 10);
        const countB = parseInt(b.total.split(' ')[0], 10);
        return countB - countA;
      })
      .slice(0, limit);

    return res.status(200).json({
      errors: [],
      message: 'Get Top Contributor Success',
      data: formattedContributor,
    });
  } catch (error) {
    next(
      new Error(`controllers/word.controller.js:getTopContributor - ${error.message}`),
    );
  }
};

module.exports = {
  setWord,
  getAllWord,
  approveWordAdmin,
  declineWordAdmin,
  getAllUserWord,
  deleteWord,
  deleteWordAdmin,
  translateWord,
  getTopContributor,
};
