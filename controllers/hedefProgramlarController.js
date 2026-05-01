const { getConnection } = require('../db');
const sql = require('mssql');

// Tüm hedef programları getir
exports.hedefProgramlariGetir = async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT
                hedef_program_id,
                universite_adi,
                sehir,
                universite_tipi,
                bolum_adi,
                fakulte_adi,
                puan_turu,
                taban_puan,
                basari_sirasi
            FROM dbo.HedefProgramlar
            ORDER BY universite_adi, bolum_adi
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Hedef programları getirme hatası:", err.message);
        res.status(500).json({ error: "Hedef programlar alınamadı." });
    }
};

// Öğrencinin hedefini kaydet/güncelle
exports.hedefKaydet = async (req, res) => {
    const ogrenciId = req.user.id;
    const { hedef_program_id } = req.body;

    if (!hedef_program_id) {
        return res.status(400).json({ error: "Hedef program id zorunludur." });
    }

    try {
        const pool = await getConnection();

        const kontrol = await pool.request()
            .input('hedef_program_id', sql.Int, hedef_program_id)
            .query(`
                SELECT hedef_program_id
                FROM dbo.HedefProgramlar
                WHERE hedef_program_id = @hedef_program_id
            `);

        if (kontrol.recordset.length === 0) {
            return res.status(404).json({ error: "Seçilen hedef program bulunamadı." });
        }

        await pool.request()
            .input('ogrenci_id', sql.Int, ogrenciId)
            .input('hedef_program_id', sql.Int, hedef_program_id)
            .query(`
                UPDATE dbo.Ogrenci
                SET hedef_program_id = @hedef_program_id
                WHERE ogrenci_id = @ogrenci_id
            `);

        res.json({
            success: true,
            message: "Hedef başarıyla kaydedildi."
        });

    } catch (err) {
        console.error("Hedef kaydetme hatası:", err.message);
        res.status(500).json({ error: "Hedef kaydedilemedi." });
    }
};

// Öğrencinin mevcut hedefini getir
exports.mevcutHedefGetir = async (req, res) => {
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('ogrenci_id', sql.Int, ogrenciId)
            .query(`
                SELECT
                    h.hedef_program_id,
                    h.universite_adi,
                    h.bolum_adi,
                    h.sehir,
                    h.universite_tipi,
                    h.fakulte_adi,
                    h.puan_turu,
                    h.taban_puan,
                    h.basari_sirasi
                FROM dbo.Ogrenci o
                INNER JOIN dbo.HedefProgramlar h
                    ON o.hedef_program_id = h.hedef_program_id
                WHERE o.ogrenci_id = @ogrenci_id
            `);

        res.json(result.recordset[0] || null);

    } catch (err) {
        console.error("Mevcut hedef getirme hatası:", err.message);
        res.status(500).json({ error: "Mevcut hedef alınamadı." });
    }
};