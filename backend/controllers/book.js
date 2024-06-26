const Book = require('../models/Book');
const fs = require('fs');
const mongoSanitize = require('mongo-sanitize');

//Créer un nouveau livre
exports.createBook = (req, res, next) => {
  //Assenit les données
  let bookObject = req.body.book;
  bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  //Créer les données du livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    ratings: [],
    averageRating: 0
  });
  //Sauvegarde le livre
  book.save()
  .then(
    () => {
      res.status(201).json({
        message: 'Livre publié avec succès'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

//Permet de trouver un livre
exports.getOneBook = (req, res, next) => {
  const cleanID = mongoSanitize(req.params.id)
  Book.findOne({_id:cleanID})
  .then(book => res.status(200).json(book))
  .catch(error => {res.status(404).json({ error })}
  );
};

//Modifie un livre
exports.modifyBook = (req, res) => {
  Book.findOne({_id: req.params.id})
    .then(book => {
      //Si l'ID de l'utilisateur est correct, alors on créer l'objet qui va nous permettre de modifier le livre
      if (book.userId == req.auth.userId) {
        let bookObject = {}
        //S'il y a une image dans la modification, on supprime l'ancienne
        if (req.file) {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, (err) => {
            if (err) console.log(err);
          });
          bookObject = {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          }
        }else{
          bookObject = {
            ...req.body
          }
        }//Les anciennes données sont remplacées par les nouvelles
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() =>  res.status(200).json({ message: 'Livre modifié' }))
                    .catch(error => res.status(400).json({ error }));
      }else {
              res.status(400).json({message: "La modification a échoué, identification impossible"});
            }
          })
          .catch((error) => {
              res.status(404).json({ error })
            })
      }

//Supprime un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({ message : '403: unauthorized request' });
          } else {
            //Si l'utilisateur est reconnu, supprime l'image de la base de donnée
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, (err => {
                      if (err) console.log(err);
                  })
              )
              Book.deleteOne({_id: req.params.id}).then(
                () => {
                  res.status(200).json({
                    message: 'Livre effacé avec succès !'
                  });
                })
              }
            }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  )
};

//Permet de voir tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

//Notation d'un livre
exports.rateBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
        .then(book => {
          //On vérifie si l'utilisateur a déjà noté le livre
          book.ratings.map(rate => {
              if (req.auth.userId === rate.userId) {
                  res.status(400).json({ message: "Vous avez déjà noté ce livre" })
              }
          })
        
        book.ratings.push({
            "userId": req.auth.userId,
            "grade": req.body.rating
        });
        //On fait la moyenne de toutes les notes et celle qu'il vient d'ajouter 
        let sum = 0;
        book.ratings.map(rate => sum += rate.grade)
        book.averageRating = sum / book.ratings.length
        Book.updateOne({ _id: req.params.id }, book)
            .then(() => { res.status(201).json(book) })
            .catch((error) => { res.status(401).json({ error }) });
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
};

//Permet de voir les livres les mieux notés
exports.bestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }))
};