// _IMPORTATIONS_ //

const express = require('express');
const fs = require('fs/promises'); // module Node pour travailler sur les fichiers
const Book = require('../models/Book'); // importation du modèle de données Book

// ROUTING //

const router = express.Router();

router.post('/', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: 'Livre ajouté!',
  });
});

// Récupère dynamiquement les données du fichier data.json et renvoie l'ensemble des livres

router.get('/', async (req, res, next) => {
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

module.exports = router;
