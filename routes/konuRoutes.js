const express = require('express');
const router = express.Router();
const konuController = require('../controllers/konuController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/dersler/:kategori', konuController.getDerslerByKategori);

router.get('/konular/:dersId', verifyToken, konuController.getKonularByDers);
router.post('/guncelle', verifyToken, konuController.updateKonuDurum);
router.get('/tamamlanan-sayi', verifyToken, konuController.getCompletedTopicCount);

module.exports = router;