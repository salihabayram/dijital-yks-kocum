const { getConnection } = require('../db');
const sql = require('mssql');

exports.getDerslerByKategori = async (req, res) => { // sınav kategorisine gore ders getirir
    const { kategori } = req.params;

    try {
        const pool = await getConnection(); // veritabanı bağlantısını havuzdan aldık
        const result = await pool.request()
            .input("kategori", sql.VarChar, kategori)
            .query(`
            SELECT ders_id, ders_adi, dersin_alani, sinav_kategorisi 
             FROM Dersler 
            WHERE sinav_kategorisi = @kategori
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Dersler çekilirken hata oluştu:", err.message);
        res.status(500).json({ error: "Dersler listelenemedi." });
    }
};

exports.getKonularByDers = async (req, res) => {
    const { dersId } = req.params;

    if (!req.user || !req.user.id) {
        console.log("HATA: req.user veya id bulunamadı! Giriş yapılmamış olabilir.");
        return res.status(401).json({ error: "Kullanıcı bilgisi alınamadı, tekrar giriş yapın." });
    }

    const ogrenciId = req.user.id;
    console.log(`DERS ID: ${dersId}, OGRENCI ID: ${ogrenciId} için veriler çekiliyor...`);

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("dersId", sql.Int, dersId)
            .input("ogrenci_id", sql.Int, ogrenciId)
            .query(`
                SELECT 
                    k.konu_id, 
                    k.konu_adi, 
                    ISNULL(oi.tamamlandi_mi, 0) as tamamlandi_mi
                FROM Konular k
                LEFT JOIN Ogrenci_Ilerleme oi 
                    ON k.konu_id = oi.konu_id 
                    AND oi.ogrenci_id = @ogrenci_id
                WHERE k.ders_id = @dersId
            `);

        res.json(result.recordset);
    } catch (err) {
        console.log("---------- !!! SQL HATASI OLUŞTU !!! ----------");
        console.error("MESAJ:", err.message);
        console.log("-----------------------------------------------");
        res.status(500).json({ error: "Veritabanı hatası oluştu." });
    }
};

exports.updateKonuDurum = async (req, res) => {
    const { konuId, tamamlandi } = req.body;

    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        const bitValue = (tamamlandi === true || tamamlandi === 1) ? 1 : 0;

        await pool.request()
            .input("p_konu_id", sql.Int, konuId)
            .input("p_ogrenci_id", sql.Int, ogrenciId)
            .input("p_tamamlandi", sql.Bit, bitValue)
            .query(`
IF EXISTS (SELECT 1 FROM Ogrenci_Ilerleme WHERE ogrenci_id = @p_ogrenci_id AND konu_id = @p_konu_id)
BEGIN
    UPDATE Ogrenci_Ilerleme 
    SET tamamlandi_mi = @p_tamamlandi 
    WHERE ogrenci_id = @p_ogrenci_id AND konu_id = @p_konu_id
END
ELSE
BEGIN
    INSERT INTO Ogrenci_Ilerleme (ogrenci_id, konu_id, tamamlandi_mi)
    VALUES (@p_ogrenci_id, @p_konu_id, @p_tamamlandi)
END
`);

        res.json({ success: true, message: "İlerleme kaydedildi." });
    } catch (err) {
        console.error("SQL GÜNCELLEME HATASI:", err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getCompletedTopicCount = async (req, res) => {
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input("ogrenci_id", sql.Int, ogrenciId)
            .query(`
                SELECT COUNT(*) AS tamamlananKonuSayisi
                FROM Ogrenci_Ilerleme
                WHERE ogrenci_id = @ogrenci_id AND tamamlandi_mi = 1
            `);

        res.json({
            completedCount: result.recordset[0].tamamlananKonuSayisi
        });
    } catch (err) {
        console.error("Tamamlanan konu sayısı alınırken hata oluştu:", err.message);
        res.status(500).json({ error: "Tamamlanan konu sayısı alınamadı." });
    }
};