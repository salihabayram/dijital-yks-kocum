const express = require('express');
const router = express.Router();

const hedefProgramlarController = require('../controllers/hedefProgramlarController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/liste', verifyToken, hedefProgramlarController.hedefProgramlariGetir);
router.get('/mevcut', verifyToken, hedefProgramlarController.mevcutHedefGetir);
router.post('/kaydet', verifyToken, hedefProgramlarController.hedefKaydet);

module.exports = router;