const express = require('express');
const router = express.Router();

const takvimController = require('../controllers/takvimController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/tasks', verifyToken, takvimController.getTasks);
router.post('/add-task', verifyToken, takvimController.addTask);
router.delete('/delete', verifyToken, takvimController.deleteTask);

module.exports = router;