const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomodoroController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/kaydet', verifyToken, pomodoroController.pomodoroKaydiniKaydet);
router.get('/ozet', verifyToken, pomodoroController.pomodoroOzetiniGetir);

module.exports = router;