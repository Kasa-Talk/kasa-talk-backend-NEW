const {kata, user} = require('../models');

// function get
const getAllKata = async (req, res) => {
  try {
    const data = await kata.findAll();

    const results = {
      message: 'succes retrive all data kata',
      results: data,
    };

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({error: 'internal server error'})
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
    return res.status(500).json({error: 'internal server error'})
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
    return res.status(500).json({error: 'internal server error'})
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
    return res.status(500).json({error: 'internal server error'})
  }
}

// ==== POST ====
const addKata = async (req, res) => {
  try {
    const {
      indonesia,
      sasak,
      audioUrl,
      contohPenggunaan,
    } = req.body

    console.log(req.body + 'aku')
  
   const newKata = await kata.create({
      indonesia: indonesia,
      sasak: sasak,
      audioUrl: audioUrl,
      contohPenggunaan: contohPenggunaan,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return res.status(200).json({
      message: "success add kata",
      data: newKata
    })

  } catch (error) {
    return res.status(500).json({error: 'internal server error'})
  }
}

// PUT
const updateKata = async (req, res) => {
  try {
    //ambil user id dari jwt
    const userId = req.user.id;

    const {kataId} = req.params;

    //cari kata yang akan diperbarui
    const kataToUpdate = await kata.findOne({
      where: {
        id: kataId,
        user_id: userId
      }
    });

    if(!kataToUpdate) {
      return res.status(400).json({
         message: `not found kata or you haven't permission to edit this kata` 
        });
    }

    const {
      indonesia,
      sasak,
      audioUrl,
      contohPenggunaan
    } = req.body;

    // lakukan pembaruan pada tabel kata jika tidak ada maka gunakan data lama
    kataToUpdate.indonesia = indonesia || kataToUpdate.indonesia
    kataToUpdate.sasak = sasak || kataToUpdate.sasak
    kataToUpdate.audioUrl = audioUrl || kataToUpdate.audioUrl
    kataToUpdate.contohPenggunaan = contohPenggunaan || kataToUpdate.contohPenggunaan

    await kataToUpdate.save()

    return res.status(200).json('success updated kata')

  } catch (error) {
   return res.status(500).json({error: 'internal server error'})
  }
}

// DELETE
const deleteKataById = async (req,res) => {
  try {
    const { id } = req.params;

    if(id) {
      return res.status(400).json({
        message: `no with id: ${id}`
      })
    }

    await kata.destroy({
      where: {
        id: id,
      }
    });

    return res.status(200).json({
      message: 'success deleted kata'
    })
  } catch (error) {
    return res.status(500).json({error: 'internal server error'})
  }
}

module.exports = { 
  getAllKata, 
  getKataById, 
  searchKataByIndonesia, 
  searchKataBySasak,
  addKata,
  deleteKataById,
  updateKata,
};