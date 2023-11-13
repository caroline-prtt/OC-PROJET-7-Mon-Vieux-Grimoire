const fs = require('fs'); // module Node pour travailler sur les fichiers
const Book = require('../models/Book'); // importation du modèle de données Book

// RÉCUPÉRATION DE TOUS LES LIVRES
exports.getAllBooks = async (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

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

// MODIFICATION D'UN LIVRE
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié!' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// SUPPRESSION D'UN LIVRE
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Livre supprimé !' }); })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// RÉCUPÉRATION DES 3 LIVRES LES MIEUX NOTÉS
exports.getBestBooks = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// NOTATION D'UN LIVRE
exports.ratingBook = (req, res, next) => {
  // On extrait les valeurs userId et rating du corps de la requête
  const { userId, rating } = req.body;

  // Vérifier que la note est comprise entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
  }

  // Puis on recherche dans les données le livre avec l'ID fourni dans les paramètres de la requête
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur a déjà noté ce livre
      const userAlreadyRating = book.ratings.find((r) => r.userId === userId);
      if (userAlreadyRating) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      // Puis on ajoute la nouvelle note au tableau "ratings"
      book.ratings.push({ userId, grade: rating });

      // Puis on met à jour la note moyenne "averageRating"
      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0); // méthode réduce est une fonction de réduction qui prend une fonction de rappel ((sum, r) => sum + r.grade) et un argument final (0) qui représente la valeur initiale de sum
      const newAverageRating = sumRatings / totalRatings;
      // eslint-disable-next-line no-param-reassign
      book.averageRating = parseFloat(newAverageRating.toFixed(2)); // parseFloat converti string en number & toFixed(2) limite à deux decimales

      // Sauvegarder les modifications _ Promesse renvoyant le livre mis à jour
      return book.save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
