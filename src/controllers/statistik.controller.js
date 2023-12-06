const { User, Kata } = require('../models');

// eslint-disable-next-line consistent-return
const getStatistik = async (req, res, next) => {
  try {
    const userTotal = await User.count();
    const kataTotal = await Kata.count();
    const contributorTotal = await Kata.count({
      distinct: true,
      col: 'userId',
    });

    return res.status(200).json({
      pengguna: userTotal,
      kontributor: contributorTotal,
      kata: kataTotal,
    });
  } catch (error) {
    next(
      new Error(`controllers/statistik.controller.js:getStatistik - ${error.message}`),
    );
  }
};

module.exports = { getStatistik };
