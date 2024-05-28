const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    ratings: [],
    averageRating: 0
  });
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

exports.getOneBook = (req, res, next) => {
  Book.findOne({_id:req.params.id})
  .then(book => res.status(200).json(book))
  .catch(error => {res.status(404).json({ error })}
  );
};


exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
  } : { ...req.body };
  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({ message : '403: unauthorized request' });
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              req.file && fs.unlink(`images/${filename}`, (err => {
                      if (err) console.log(err);
                  })
              );
              Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                  .catch(error => res.status(400).json({ error }));
          }
      })
      .catch((error) => {
          res.status(404).json({ error });
      });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({ message : '403: unauthorized request' });
          } else {
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
        // message: `delete ${error}`
      });
    }
  )
};

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

exports.rateBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
      .then(book => {
        let alreadyRated = book.ratings.find(rating => rating.userId == req.token.userId);
        if (alreadyRated) {
          res.status(400).json({ message: "Vous avez déjà noté ce livre" })
        }
          // book.ratings.map(rate => {
          //     if (req.auth.userId === rate.userId) {
          //         res.status(400).json({ message: "Vous avez déjà noté ce livre" })
          //       }
          // })
          book.ratings.push({
              "userId": req.auth.userId,
              "grade": req.body.rating
          });
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

exports.bestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }))
};