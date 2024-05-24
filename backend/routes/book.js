const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const upload = require('../middleware/upload');
const bookCtrl = require('../controllers/book');


router.get('/bestrating', bookCtrl.bestRating)
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/',auth, upload, bookCtrl.createBook);
router.put('/:id', auth, upload , bookCtrl.modifyBook);
router.delete('/:id', bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.rateBook)

module.exports = router;