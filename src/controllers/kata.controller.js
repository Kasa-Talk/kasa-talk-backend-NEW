const getAllKata = (req, res) => {
  res.status(200).json({
    error: false,
    message: 'test',
    results: {
      name: 'test',
    },
  });
};

module.exports = { getAllKata };
