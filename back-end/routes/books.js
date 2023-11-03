// _IMPORTATIONS_ //

const express = require('express');
const booksControllers = require('../controllers/books');
const auth = require('../middleware/auth'); // importation de l'authentification avec token
const multer = require('../middleware/multer-config');

// ROUTING //

const router = express.Router();

router.get('/', booksControllers.getAllBooks);
router.get('/:id', booksControllers.getOneBook);
router.post('/', auth, multer, booksControllers.createBook);

module.exports = router;
