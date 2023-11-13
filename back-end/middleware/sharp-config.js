const sharp = require('sharp');
const fs = require('fs');

const resizeAndConvertToWebp = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  sharp(req.file.path)
    .resize(206, 260)
    .toFormat('webp')
    .toFile('images/' + req.file.filename.replace(/\.(jpg|jpeg|png)$/, '.webp'))
    .then(() => {
      req.file.filename = req.file.filename.replace(/\.(jpg|jpeg|png)$/, '.webp');

      // Supprimer le fichier d'origine après la conversion en WebP
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting original file:', err);
        }
        next();
      });
    })
    .catch((error) => {
      console.error('Image processing error:', error);
      next();
    });
};

module.exports = resizeAndConvertToWebp;
