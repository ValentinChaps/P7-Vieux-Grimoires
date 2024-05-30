const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');

mongoose.connect(`mongodb+srv://${process.env.LOGIN}:${process.env.PASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority&appName=Cluster0'`)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  
const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.json())

app.use('/api/books' , bookRoutes)
app.use('/api/auth' , userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;