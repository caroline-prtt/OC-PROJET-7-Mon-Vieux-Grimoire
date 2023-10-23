const express = require('express');
const fs = require('fs/promises');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// app.use('/api/books', (req, res, next) => {
//   const books = [
//     {
//       id: '1',
//       userID: 'clc4wj5lh3gyi0ak4eq4n8syr',
//       title: 'Milwaukee Mission',
//       author: 'Elder Cooper',
//       imageUrl: 'https://via.placeholder.com/206x260',
//       year: 2021,
//       genre: 'Policier',
//       rating: [
//         {
//           userId: '1',
//           grade: 5,
//         },
//         {
//           userId: '1',
//           grade: 5,
//         },
//         {
//           userId: 'clc4wj5lh3gyi0ak4eq4n8syr',
//           grade: 5,
//         },
//         {
//           userId: '1',
//           grade: 5,
//         },
//       ],
//       averageRating: 3,
//     },
//     {
//       id: '2',
//       userID: 'clbxs3tag6jkr0biul4trzbrv',
//       title: 'Book for Esther',
//       author: 'Alabaster',
//       imageUrl: 'https://via.placeholder.com/206x260',
//       year: 2022,
//       genre: 'Paysage',
//       rating: [
//         {
//           userId: 'clbxs3tag6jkr0biul4trzbrv',
//           grade: 4,
//         },
//         {
//           userId: '1',
//           grade: 5,
//         },
//         {
//           userId: '1',
//           grade: 5,
//         },
//         {
//           userId: '1',
//           grade: 5,
//         },
//       ],
//       averageRating: 4.2,
//     },
//     // ajouter les autres données si nécessaire...
//   ];
//   res.status(200).json(books);
// });

// Middleware qui récupère dynamiquement les données du fichier data.json
app.use('/api/books', async (req, res, next) => {
  try {
    // Chargez les données depuis le fichier data.json de manière asynchrone
    const data = await fs.readFile('../public/data/data.json', 'utf8');
    const books = JSON.parse(data);
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la lecture des données' });
  }
});

module.exports = app;
