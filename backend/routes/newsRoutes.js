const express = require('express');
const router = express.Router();
const { getSportsNews } = require('../controllers/newsController');

router.get('/', getSportsNews);

module.exports = router;
