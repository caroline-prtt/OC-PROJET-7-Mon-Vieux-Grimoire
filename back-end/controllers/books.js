const fs = require('fs/promises'); // module Node pour travailler sur les fichiers
const Book = require('../models/Book'); // importation du modèle de données Book

// AJOUT D'UN NOUVEAU LIVRE
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });

  book.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }); })
    .catch((error) => { res.status(400).json({ error }); });
};

// RÉCUPÉRATION D'UN LIVRE SELON ID
exports.getOneBook = async (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

// RÉCUPÉRATION DES 3 LIVRES LES MIEUX NOTÉS
exports.getBestBooks = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// RÉCUPÉRATION DE TOUS LES LIVRES
exports.getAllBooks = async (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
