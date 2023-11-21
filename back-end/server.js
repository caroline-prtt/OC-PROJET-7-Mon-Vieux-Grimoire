const http = require('http'); // importation du module HTTP de Node
const app = require('./app'); // importation de l'application Express définie par le fichier app.js

// NORMALISATION DU PORT
// Fonction pour s'assurer que le port sur lequel le serveur écoute est correctement défini et normalisé
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// CONFIGURATION DU PORT sur lequel le serveur écoutera les connexion
// Utilise la valeur du port définit dans la variable d'environnement OU le port 4000 par défaut
const port = normalizePort(process.env.PORT || '4000');

app.set('port', port);

// CRÉATION DU SERVEUR avec notre application comme argument
const server = http.createServer(app);

// GESTION DES ERREURS de mise en écoute du serveur
const errorHandler = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// ECOUTE DU SERVEUR :
// En cas d'erreur, la fonction errorHandler est appelée
server.on('error', errorHandler);
// Si succès, affiche message indiquant l'adresse sur laquelle le serveur écoute
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);
