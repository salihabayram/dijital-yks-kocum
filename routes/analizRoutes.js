const express = require('express');
const router = express.Router();
const analizController = require('../controllers/analizController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/liste', verifyToken, analizController.denemeleriListele);
router.get('/:id', verifyToken, analizController.denemeDetayiGetir);
router.post('/kaydet', verifyToken, analizController.denemeKaydet);
router.delete('/:id', verifyToken, analizController.denemeSil);

module.exports = router;