const sharp = require('sharp');
const fs = require('fs');
const path = require('path')
const acceptedFormat = ['jpeg' , 'jpg', 'png' , 'webp' , 'avif']

module.exports = async (req, res, next) => {
    try{
        if (req.file) {
            const { buffer, originalname } = req.file;
            const fileDatas = path.parse(originalname);
            const link = fileDatas.name.split(' ').join('_') + Date.now() + '.webp';
            const metadata = await sharp(buffer).metadata()
            if (!acceptedFormat.includes(metadata.format)) {
                res.status(500).json({message : "Ce type de fichier n'est pas accepté."})
            }
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


// const sharp = require('sharp');
// const acceptedFormat = ['jpeg' , 'jpg', 'png' , 'webp' , 'avif']

// module.exports = async (req, res, next) => {
//     try{
//         if (!req.file) {
//         return next();
//         }
//         console.log(req.file)
//         const metadata = await sharp(req.file.buffer).metadata();
        // if (!acceptedFormat.includes(metadata.format)) {
        //     res.status(500).json({message : "Ce type de fichier n'est pas accepté."})
        // }
//         const fileName = req.file.originalName.split('.')[0];
//         const uniqueFileName = fileName + Date.now() + '.webp';
//         const pathImage = '/images' + uniqueFileName
//         req.file.fileName = uniqueFileName
        
//     await sharp(req.file.buffer)
//         .resize({ width: 206, height: 260, fit:'cover', withoutEnlargement: false })
//         .toFormat('webp')
//         .toFile(pathImage);

//         next()
        
//   }
//   catch(error){
//     res.status(500).json({error})
//   }
// }