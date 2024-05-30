const multer = require('multer');
const storage = multer.memoryStorage();

//Gestion des téléchargement des images
module.exports = multer({storage: storage}).single('image');