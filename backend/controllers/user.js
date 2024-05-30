const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

//Création d'un compte
exports.signup = (req, res, next) => {
    //Permet de hacher le mot de passe
    bcrypt.hash(req.body.password, 10)
    //On utilise le hash pour créer un utilisateur
        .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        //On enregistre l'utilisateur dans la base de donnée
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    };

//Connexion
exports.login = (req, res, next) => {
    //On vérifie si l'utilisateur existe dans la base de donnée
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            //On compare le mot de passe haché avec celui de la base de donnée
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWTKEY,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };