const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const storage = multer.diskStorage({
  // Définit dans quel répertoire du serveur les fichiers seront enregistrés
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Définit nom du fichier : espace remplacé par underscore + horodatage
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  },
});

module.exports = multer({ storage }).single('image');
