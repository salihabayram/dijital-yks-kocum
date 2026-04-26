const { getConnection } = require('../db');
const sql = require('mssql');

exports.pomodoroKaydiniKaydet = async (req, res) => {
    const ogrenciId = req.user.id;

    const {
        ders_id,
        baslangic_zamani,
        bitis_zamani,
        calisma_suresi_saniye,
        mola_suresi_saniye,
        tarih
    } = req.body;

    try {
        const pool = await getConnection();

        await pool.request()
            .input('ogrenci_id', sql.Int, ogrenciId)
            .input('ders_id', sql.Int, ders_id)
            .input('baslangic_zamani', sql.VarChar, baslangic_zamani)
            .input('bitis_zamani', sql.VarChar, bitis_zamani)
            .input('calisma_suresi_saniye', sql.Int, calisma_suresi_saniye)
            .input('mola_suresi_saniye', sql.Int, mola_suresi_saniye)
            .input('tarih', sql.Date, tarih)
            .query(`
                INSERT INTO Callisma_kayitlari
                (ogrenci_id, ders_id, baslangic_zamani, bitis_zamani, calisma_suresi_saniye, mola_suresi_saniye, tarih)
                VALUES
(
    @ogrenci_id,
    @ders_id,
    CONVERT(datetime, @baslangic_zamani, 120),
    CONVERT(datetime, @bitis_zamani, 120),
    @calisma_suresi_saniye,
    @mola_suresi_saniye,
    @tarih
)
            `);

        res.json({ success: true, message: 'Pomodoro kaydı eklendi.' });
    } catch (err) {
        console.error('Pomodoro kayıt hatası:', err.message);
        res.status(500).json({ error: 'Pomodoro kaydı eklenemedi.' });
    }
};

exports.pomodoroOzetiniGetir = async (req, res) => {
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        const bugunkuToplamResult = await pool.request()
            .input('ogrenci_id', sql.Int, ogrenciId)
            .query(`
                SELECT ISNULL(SUM(calisma_suresi_saniye), 0) AS bugunkuToplamCalisma
                FROM Callisma_kayitlari
                WHERE ogrenci_id = @ogrenci_id
                  AND tarih = CAST(GETDATE() AS DATE)
            `);

        const enIyiResult = await pool.request()
            .input('ogrenci_id', sql.Int, ogrenciId)
            .query(`
                SELECT ISNULL(MAX(calisma_suresi_saniye), 0) AS enIyiCalisma
                FROM Callisma_kayitlari
                WHERE ogrenci_id = @ogrenci_id
            `);

        res.json({
            bugunkuToplamCalisma: bugunkuToplamResult.recordset[0].bugunkuToplamCalisma,
            enIyiCalisma: enIyiResult.recordset[0].enIyiCalisma
        });
    } catch (err) {
        console.error('Pomodoro özet hatası:', err.message);
        res.status(500).json({ error: 'Pomodoro özeti alınamadı.' });
    }
};