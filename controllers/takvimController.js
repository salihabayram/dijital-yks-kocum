const { getConnection } = require('../db');
const sql = require('mssql');

exports.getTasks = async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('ogrenci_id', sql.Int, req.user.id)
            .query(`
                SELECT 
                    gorev_id,
                    baslik,
                    hedef_tarih,
                    oncelik_seviyesi,
                    yapildi_mi
                FROM Gunluk_Gorevler
                WHERE ogrenci_id = @ogrenci_id
                ORDER BY hedef_tarih ASC, olusturma_tarihi ASC
            `);

        const tasksObj = {};

        result.recordset.forEach((row) => {
            const d = new Date(row.hedef_tarih);

            const dateStr =
                d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');

            if (!tasksObj[dateStr]) {
                tasksObj[dateStr] = [];
            }

            tasksObj[dateStr].push({
                id: row.gorev_id,
                text: row.baslik,
                priority: row.oncelik_seviyesi || 'ORTA',
                status: row.yapildi_mi ? 'done' : 'pending'
            });
        });

        res.json(tasksObj);
    } catch (err) {
        console.error("Takvim görevleri alınırken hata:", err.message);
        res.status(500).json({ error: "Takvim görevleri alınamadı." });
    }
};

exports.addTask = async (req, res) => {
    const { text, date, priority } = req.body;

    if (!text || !date) {
        return res.status(400).json({ error: "Görev metni ve tarih zorunludur." });
    }

    try {
        const pool = await getConnection();

        await pool.request()
            .input('ogrenci_id', sql.Int, req.user.id)
            .input('baslik', sql.NVarChar(255), text)
            .input('aciklama', sql.NVarChar(255), '')
            .input('kategori', sql.VarChar(50), 'KİŞİSEL')
            .input('oncelik_seviyesi', sql.VarChar(20), priority || 'ORTA')
            .input('hedef_tarih', sql.Date, date)
            .query(`
                INSERT INTO Gunluk_Gorevler
                (ogrenci_id, baslik, aciklama, kategori, oncelik_seviyesi, olusturma_tarihi, hedef_tarih, yapildi_mi)
                VALUES
                (@ogrenci_id, @baslik, @aciklama, @kategori, @oncelik_seviyesi, GETDATE(), @hedef_tarih, 0)
            `);

        res.status(201).json({ message: "Görev eklendi." });
    } catch (err) {
        console.error("Takvim görev ekleme hatası:", err.message);
        res.status(500).json({ error: "Görev eklenemedi." });
    }
};

exports.deleteTask = async (req, res) => {
    const { gorevId } = req.body;

    if (!gorevId) {
        return res.status(400).json({ error: "Görev id eksik." });
    }

    try {
        const pool = await getConnection();

        await pool.request()
            .input('gorev_id', sql.Int, gorevId)
            .input('ogrenci_id', sql.Int, req.user.id)
            .query(`
                DELETE FROM Gunluk_Gorevler
                WHERE gorev_id = @gorev_id
                  AND ogrenci_id = @ogrenci_id
            `);

        res.status(200).json({ message: "Görev silindi." });
    } catch (err) {
        console.error("Takvim görev silme hatası:", err.message);
        res.status(500).json({ error: "Görev silinemedi." });
    }
};