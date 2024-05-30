const sharp = require('sharp');
const fs = require('fs');
const path = require('path')
const acceptedFormat = ['jpeg' , 'jpg', 'png' , 'webp' , 'avif']

//Permet d'optimiser le fichier image uploader
module.exports = async (req, res, next) => {
    try{
        if (req.file) {
            const { buffer, originalname } = req.file;
            const fileDatas = path.parse(originalname);
            const link = fileDatas.name.split(' ').join('_') + Date.now() + '.webp';
            const metadata = await sharp(buffer).metadata()
            //On vérifie si le format du fichier est accepté
            if (!acceptedFormat.includes(metadata.format)) {
                res.status(500).json({message : "Ce type de fichier n'est pas accepté."})
            }
            //Modification de la taille de l'image, de son format et on définit l'endroit ou elle sera stocké
            fs.mkdir('./images', (err) => {
                sharp(buffer)
                    .resize({ width: 206, height: 260, fit:'cover', withoutEnlargement: false })
                    .toFormat('webp')
                    .toFile(`./images/${link}`, (error) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).json({ error: "Impossible de sauvegarder l'image" });
                        } else {
                            req.file.filename = link;
                        }
                        next();
                    });
            })}}
    catch(error){
        res.status(500).json({error})
    }
};