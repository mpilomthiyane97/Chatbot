const express = require('express');
const { generateFacts } = require('../controllers/factController');

const router = express.Router();

router.post('/generate-facts', generateFacts);

module.exports = router;
