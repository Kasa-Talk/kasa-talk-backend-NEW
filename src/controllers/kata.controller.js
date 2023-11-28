const {kata} = require('../models');

const getAllKata = async (req, res) => {
  try {
    const data = await kata.findAll();

    const results = {
      message: 'succes retrive all data kata',
      results: data,
    };

    return res.status(200).json(results);
  } catch (error) {
    const data = {
      message: 'failed retrive all data',
      errors: error,
    };
    
    return res.status(400).json(data);
  }
};

const getKataById = async (req, res) => {
  try {
    const {id} = req.params;
    const data = await kata.findByPk(id);

    if(data === null) {
      return res.status(400).json({
        message: `no data with id: ${id}`,
      })
    }

    return res.status(200).json({
      message: 'succes get data',
      result: data
    })
  } catch (error) {
    return res.status(400).json({
      message: 'failed to get data',
      error: error
    })
  }
}

const searchKataByIndonesia = async (req, res) => {
  try {
    const {cari} = req.query
    const data = await kata.findOne({
      where: { 
        indonesia: cari,
        status: 'active'
      }
    });

    if (data === null) {
      return res.status(400).json({
        message: `kata ${cari} not found in our database`
      });
    }

    return res.status(200).json({
      message: 'succes find kata',
      result: data
    });

  } catch (error) {
    return res.status(400).json({
      message: 'server error',
      error: error
    })
  }
}

const searchKataBySasak = async (req, res) => {
  
  try {
    const {cari} = req.query;
    const data = await kata.findOne({
      where: { sasak: cari}
    });

    if (data === null) {
      return res.status(400).json({
        message: `${cari} not found in our database`
      });
    }

    return res.status(200).json({
      message: 'succes find kata',
      result: data
    });

  } catch (error) {
    return res.status(400).json({
      message: 'server error',
      error: error
    })
  }
}

module.exports = { 
  getAllKata, 
  getKataById, 
  searchKataByIndonesia, 
  searchKataBySasak 
};