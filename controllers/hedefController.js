const { getConnection } = require("../db");
const sql = require("mssql");

/* Şehirleri getir */
exports.getSehirler = async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT DISTINCT sehir
            FROM dbo.HedefProgramlar
            WHERE sehir IS NOT NULL
            ORDER BY sehir ASC
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Şehirler alınamadı:", err.message);
        res.status(500).json({ error: "Şehirler alınamadı." });
    }
};

/* Şehre göre üniversiteleri getir */
exports.getUniversiteler = async (req, res) => {
    const { sehir } = req.query;

    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input("sehir", sql.NVarChar, sehir)
            .query(`
                SELECT DISTINCT universite_adi, universite_tipi
                FROM dbo.HedefProgramlar
                WHERE sehir = @sehir
                ORDER BY universite_adi ASC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Üniversiteler alınamadı:", err.message);
        res.status(500).json({ error: "Üniversiteler alınamadı." });
    }
};

/* Üniversiteye göre bölümleri getir */
exports.getBolumler = async (req, res) => {
    const { universite } = req.query;

    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input("universite", sql.NVarChar, universite)
            .query(`
                SELECT 
                    hedef_program_id,
                    universite_adi,
                    sehir,
                    universite_tipi,
                    bolum_adi,
                    fakulte_adi,
                    puan_turu,
                    taban_puan,
                    basari_sirasi,
                    yil
                FROM dbo.HedefProgramlar
                WHERE universite_adi = @universite
                ORDER BY bolum_adi ASC, yil DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Bölümler alınamadı:", err.message);
        res.status(500).json({ error: "Bölümler alınamadı." });
    }
};

/* Hedef kaydet */
exports.saveHedef = async (req, res) => {
    const ogrenciId = req.user.id;
    const { hedef_program_id } = req.body;

    if (!hedef_program_id) {
        return res.status(400).json({ error: "Hedef program seçilmedi." });
    }

    try {
        const pool = await getConnection();

        await pool.request()
            .input("ogrenci_id", sql.Int, ogrenciId)
            .input("hedef_program_id", sql.Int, hedef_program_id)
            .query(`
                UPDATE dbo.Ogrenci
                SET hedef_program_id = @hedef_program_id
                WHERE ogrenci_id = @ogrenci_id
            `);

        res.json({ success: true, message: "Hedef başarıyla kaydedildi." });
    } catch (err) {
        console.error("Hedef kaydedilemedi:", err.message);
        res.status(500).json({ error: "Hedef kaydedilemedi." });
    }
};

/* Öğrencinin hedefini getir */
exports.getHedef = async (req, res) => {
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input("ogrenci_id", sql.Int, ogrenciId)
            .query(`
                SELECT 
                    hp.hedef_program_id,
                    hp.universite_adi,
                    hp.sehir,
                    hp.universite_tipi,
                    hp.bolum_adi,
                    hp.fakulte_adi,
                    hp.puan_turu,
                    hp.taban_puan,
                    hp.basari_sirasi,
                    hp.yil
                FROM dbo.Ogrenci o
                LEFT JOIN dbo.HedefProgramlar hp
                    ON o.hedef_program_id = hp.hedef_program_id
                WHERE o.ogrenci_id = @ogrenci_id
            `);

        res.json(result.recordset[0] || null);
    } catch (err) {
        console.error("Hedef getirilemedi:", err.message);
        res.status(500).json({ error: "Hedef getirilemedi." });
    }
};

