const express = require('express');
// importation du module ("fs") de Node qui permet de travailler sur les fichiers
const fs = require('fs/promises');
const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://cprtt:CPLIWiR30XScB9Hd@cluster0.tu90xcy.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// Middleware qui intercepte les requêtes JSON et les mets à dispo dans l'objet req.body
app.use(express.json());

// Gestion du CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.post('/api/books', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: 'Livre ajouté!',
  });
});

// Middleware qui récupère dynamiquement les données du fichier data.json
// et renvoie l'ensemble des livres
app.get('/api/books', async (req, res, next) => {
  try {
    // fs.readFile utilise le module Node "fs" avec la méthode readFile pour lire le fichier JSON
    const data = await fs.readFile('../public/data/data.json', 'utf8');
    // JSON.parse est une fonction JS qui analyse une chaine de caractère JSON en objet JS
    // Donc data contient les objets en JSON et books les objets en JS
    const books = JSON.parse(data);
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la lecture des données' });
  }
});

module.exports = app;
