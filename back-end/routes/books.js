// _IMPORTATIONS_ //

const express = require('express');
const booksControllers = require('../controllers/books');

// ROUTING //

const router = express.Router();

router.post('/', booksControllers.createBook);
router.get('/', booksControllers.getAllBooks);

module.exports = router;
