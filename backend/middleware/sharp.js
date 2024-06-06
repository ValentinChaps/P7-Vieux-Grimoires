const sharp = require("sharp");
const acceptedFormat = ['jpeg' , 'jpg', 'png' , 'webp' , 'avif']

module.exports = async (req, res, next) => {
  try {
    if (req.file) {
        const {buffer, originalname} = req.file;
        const name = originalname.split(" ").join("_");
        const link = name + Date.now() + ".webp";
        const metadata = await sharp(buffer).metadata()
        
        //On vérifie si le format du fichier est accepté
        if (!acceptedFormat.includes(metadata.format)) {
            res.status(500).json({message : "Ce type de fichier n'est pas accepté."})
        }

      //Modification de la taille de l'image, de son format et on définit l'endroit ou elle sera stocké
      await sharp(buffer)
        .resize({ width: 206, height: 260, fit:'cover'})
        .toFormat('webp')
        .toFile(`images/${ link }`);

      // Sauvegarde le chemin vers l'image
      req.file.filename = link;
    }
    next();
  } catch (error) {
    res.status(500).json({error})
  }
};