const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // récupère le token après Bearer et espace
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // on vérifie validité token et on le décode : renvoie le payload cad l'id utilisateur
    const { userId } = decodedToken; // Stocke l'id récupéré
    req.auth = { // Ajoute les information d'authentification à l'objet request
      userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
