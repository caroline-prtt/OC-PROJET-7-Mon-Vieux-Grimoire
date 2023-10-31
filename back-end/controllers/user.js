/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
const bcrypt = require('bcrypt');
const User = require('../models/User');

// TEST VALIDITÉ FORMAT EMAIL

const isValidEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email); // renvoie true ou false
};

// MIDDLEWARE INSCRIPTION
// **********************

exports.signup = (req, res, next) => {
// Valider le format de l'adresse email et la longueur du mot de passe
  if (!isValidEmail(req.body.email) || req.body.password.length < 8) {
    console.log('Inscription impossible : email ou mot de passe invalide');
    return res.status(400).json({ error: 'Inscription impossible : email ou mot de passe invalide' });
  }

  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({ // création nouveau client
        email: req.body.email,
        password: hash,
      });
      user.save() // Pour sauvegarder dans la base de données
        .then(() => {
          console.log('Inscription nouveau client RÉUSSIE !');
          return res.status(201).json({ message: 'Utilisateur créé !' });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// MIDDLEWARE CONNEXION
// ********************

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res.status(401).json({ message: 'Paire identifiant/mot de passe incorrect' });
      } else {
        bcrypt.compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res.status(401).json({ message: 'Paire identifiant/mot de passe incorrect' });
            } else {
              res.status(200).json({
                userId: user._id,
                token: 'TOKEN',
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
