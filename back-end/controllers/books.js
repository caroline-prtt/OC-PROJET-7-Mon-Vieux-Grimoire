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
  // extrait le contenu du champ book de la requête et convertit le JSON en objet JS
  const bookObject = JSON.parse(req.body.book);
  // supprime certaines propriétés non utilisées lors de la création d'un livre
  delete bookObject._id;
  delete bookObject._userId;
  // création nouvelle instance du modèle Book - combine les propriétés de bookObject avec l'ID de l'utilisateur et l'URL de l'image
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  // Enregistrement du livre dans la base de données
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
  // Objet contenant les informations du livre à mettre à jour
  // Si nouvelle image, l'URL est mise à jour
  // Sinon objet créé avec les informations du corps de la requête
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : { ...req.body };
  // supprime la propriété _userId de l'objet bookObject pour éviter de modifier l'ID de l'utilisateur associé au livre
  delete bookObject._userId;
  // Recherche le livre spécifique à l'aide de son id
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // vérifie si l'ID de l'utilisateur associé au livre correspond à l'ID de l'utilisateur authentifié
      if (book.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        // on stocke l'url de l'ancienne image qui va être modifiée
        const oldImageUrl = book.imageUrl;
        // puis mise à jour avec les nouvelles informations
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => {
            // supprime l'ancienne image si une nouvelle image est téléchargée
            if (req.file) {
              // divise l'URL de l'ancienne image en utilisant "/images/" comme délimiteur et récupère le deuxième élément du tableau ainsi créé, donc le nom du fichier
              const filename = oldImageUrl.split('/images/')[1];
              // supprime le fichier spécifié
              fs.unlink(`images/${filename}`, (err) => {
                if (err) {
                  console.error('Error deleting old image:', err);
                }
              });
            }
            res.status(200).json({ message: 'Livre modifié!' });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// SUPPRESSION D'UN LIVRE
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // vérifie si l'ID de l'utilisateur associé au livre correspond à l'ID de l'utilisateur authentifié
      if (book.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        // divise l'URL de l'ancienne image en utilisant "/images/" comme délimiteur et récupère le deuxième élément du tableau ainsi créé, donc le nom du fichier
        const filename = book.imageUrl.split('/images/')[1];
        // suppression de l'image spécifiée
        fs.unlink(`images/${filename}`, () => {
          // Après avoir supprimé le fichier image, on supprime le livre de la base de données en utilisant son ID
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
  // recherche dans tous les livres
  // trie les résultats en fonction de la propriété averageRating par ordre décroissant donc les mieux notés en premier
  // limité à 3 résultats
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
