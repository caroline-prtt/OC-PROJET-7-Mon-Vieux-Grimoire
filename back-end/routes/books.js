// _IMPORTATIONS_ //

const express = require('express');
const booksControllers = require('../controllers/books');
const auth = require('../middleware/auth'); // importation de l'authentification avec token

// ROUTING //

const router = express.Router();

router.post('/', auth, booksControllers.createBook);
router.get('/', booksControllers.getAllBooks);

module.exports = router;
