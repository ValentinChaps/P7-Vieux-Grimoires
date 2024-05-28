const express = require('express');
const router = express.Router();
const login = require('../middleware/rate-limit')
const validator = require('../middleware/password-validator')
const userCtrl = require('../controllers/user');

router.post('/signup', validator, userCtrl.signup);
router.post('/login', login.limiter, userCtrl.login);

module.exports = router;