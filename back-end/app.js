// _IMPORTATIONS_ //

const express = require('express');
const mongoose = require('mongoose');
const booksRoutes = require('./routes/books');

// _CRÉATION APPLICATION EXPRESS_ //

const app = express();

// _LIAISON BASE DE DONNÉES_ //

mongoose.connect(
  'mongodb+srv://cprtt:CPLIWiR30XScB9Hd@cluster0.tu90xcy.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// _MIDDLEWARES GÉNÉRAUX_ //

// Intercepte les requêtes JSON et les mets à dispo dans l'objet req.body
app.use(express.json());

// Gestion du CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Fait appel au routing CRUD
app.use('/api/books', booksRoutes);

module.exports = app;
