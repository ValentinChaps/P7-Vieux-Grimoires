const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
// const bookCtrl = require('../controllers/book');

// router.post('/', bookCtrl.createThing);
// router.get('/', bookCtrl.getAllStuff);
// router.get('/:id', bookCtrl.getOneThing);
// router.put('/:id', bookCtrl.modifyThing);
// router.delete('/:id', bookCtrl.deleteThing);


const Book = require('../models/Book');

router.post('/', auth, multer, (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    title: req.body.title,
    author: req.body.author,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    year: req.body.year,
    genre: req.body.genre,
    rating: req.body.grade,
  });
  book.save()
  .then(
    () => {
      res.status(201).json({
        message: 'Post saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
});

router.get('/:id', (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
});

router.put('/:id', (req, res, next) => {
  const book = new Book({
    _id: req.params.id,
    title: req.body.title,
    author: req.body.author,
    imageUrl: req.body.imageUrl,
    year: req.body.year,
    genre: req.body.genre,
    rating: req.body.grade,
    averageRating: req.body.averageRating,
    userId: req.body.userId
  });
  Book.updateOne({_id: req.params.id}, book).then(
    () => {
      res.status(201).json({
        message: 'Book updated successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
});

router.delete('/:id', (req, res, next) => {
  Book.deleteOne({_id: req.params.id}).then(
    () => {
      res.status(200).json({
        message: 'Deleted!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
});

router.get('/' +
  '', (req, res, next) => {
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
});

module.exports = router;