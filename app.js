require('dotenv').config();

const { getConnection } = require('./db');
getConnection();


const express = require('express');
const pomodoroRoutes = require('./routes/pomodoroRoutes');
const authRoutes = require('./routes/authRoutes');
const konuRoutes = require('./routes/konuRoutes');
const gorevRoutes = require('./routes/gorevRoutes');
const analizRoutes = require('./routes/analizRoutes');
const takvimRoutes = require('./routes/takvimRoutes');
const hedefRoutes = require('./routes/hedefRoutes');
const hedefProgramlarRoutes = require('./routes/hedefProgramlarRoutes')
const app = express(); // 

// 2. ogrenci dogrulama ayarları
app.use(express.json());
app.use(express.static('public'));

app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/konu', konuRoutes);
app.use('/api/gorev', gorevRoutes);
app.use('/api/takvim', takvimRoutes);
app.use('/api/analiz', analizRoutes);
app.use('/api/hedef', hedefRoutes);
app.use('/api/hedef-programlar', hedefProgramlarRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} portunda çalışıyor...`);
    console.log(`👉 Giriş sayfası: http://localhost:${PORT}`);
    console.log(`📚 Konu Takip: http://localhost:${PORT}/konu-takip`);
    console.log(`📅 Takvim: http://localhost:${PORT}/takvim.html`);
});



