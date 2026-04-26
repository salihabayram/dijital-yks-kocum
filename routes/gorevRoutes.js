const express = require('express');
const router = express.Router();
const gorevController = require('../controllers/gorevController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, gorevController.getDashboardStats);
router.get('/weekly', verifyToken, gorevController.getWeeklyStats);
router.get('/deneme', verifyToken, gorevController.getDenemeStats);

router.post('/ekle', verifyToken, gorevController.addGorev);
router.post('/sil', verifyToken, gorevController.deleteGorev);
router.post('/guncelle', verifyToken, gorevController.updateGorevStatus);

router.get('/:tarih', verifyToken, gorevController.getGorevlerByTarih);

module.exports = router;