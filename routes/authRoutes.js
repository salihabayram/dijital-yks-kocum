const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Kayıt rotası
router.post('/register', authController.register);

// Giriş rotası 
router.post('/login', authController.login);

// /anasayfa  ve diğerleri için de yapılacak için de yapılacak

module.exports = router;