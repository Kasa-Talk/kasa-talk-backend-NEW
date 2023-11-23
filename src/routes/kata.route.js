const router = require('express').Router();
const {getAllKata} = require('../controllers/kata.controller')

router.get('/list', getAllKata)

module.exports = router;

