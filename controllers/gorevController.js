const { getConnection } = require('../db');
const sql = require('mssql');

/* =======================================================
   1. DASHBOARD ANALİZ
======================================================= */
exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await getConnection();
        const sid = req.user.id;

        const statsResult = await pool.request()
            .input('sid', sql.Int, sid)
            .query(`
                SELECT 
                    (SELECT TOP 1 ad FROM dbo.Ogrenci WHERE ogrenci_id = @sid) AS ogrenci_adi,
                    (SELECT COUNT(*) 
                     FROM dbo.Ogrenci_Ilerleme 
                     WHERE ogrenci_id = @sid AND tamamlandi_mi = 1) AS completedCount,

                    ISNULL((
                        SELECT SUM(calisma_suresi_saniye)
                        FROM dbo.Callisma_kayitlari
                        WHERE ogrenci_id = @sid
                          AND tarih >= CAST(DATEADD(DAY, -7, GETDATE()) AS DATE)
                    ), 0) / 3600.0 AS buHaftaSaat,

                    ISNULL((
                        SELECT SUM(calisma_suresi_saniye)
                        FROM dbo.Callisma_kayitlari
                        WHERE ogrenci_id = @sid
                          AND tarih >= CAST(DATEADD(DAY, -14, GETDATE()) AS DATE)
                          AND tarih < CAST(DATEADD(DAY, -7, GETDATE()) AS DATE)
                    ), 0) / 3600.0 AS gecenHaftaSaat
            `);

        const progressResult = await pool.request()
            .input('sid', sql.Int, sid)
            .query(`
                SELECT 
                    d.sinav_kategorisi,
                    ISNULL(d.dersin_alani, 'Genel') AS dersin_alani,
                    d.ders_adi,
                    COUNT(k.konu_id) AS toplam,
                    SUM(CASE WHEN oi.tamamlandi_mi = 1 THEN 1 ELSE 0 END) AS biten
                FROM dbo.Dersler d
                JOIN dbo.Konular k ON d.ders_id = k.ders_id
                LEFT JOIN dbo.Ogrenci_Ilerleme oi 
                    ON k.konu_id = oi.konu_id AND oi.ogrenci_id = @sid
                GROUP BY d.sinav_kategorisi, d.dersin_alani, d.ders_adi
            `);

        const progressData = {
            tyt: { labels: [], values: [] },
            aytSay: { labels: [], values: [] },
            aytEa: { labels: [], values: [] },
            aytSoz: { labels: [], values: [] }
        };

        const alanMap = {
            "Sayisal": "aytSay",
            "Sayısal": "aytSay",
            "Esit Agirlik": "aytEa",
            "Eşit Ağırlık": "aytEa",
            "Sözel": "aytSoz",
            "Sozel": "aytSoz"
        };

        progressResult.recordset.forEach((row) => {
            const yuzde = row.toplam > 0 ? Math.round((row.biten / row.toplam) * 100) : 0;

            let key = null;
            if (row.sinav_kategorisi === "TYT") {
                key = "tyt";
            } else {
                key = alanMap[row.dersin_alani];
            }

            if (key && progressData[key]) {
                progressData[key].labels.push(row.ders_adi);
                progressData[key].values.push(yuzde);
            }
        });

        const s = statsResult.recordset[0] || {};
        const buHafta = Math.round(Number(s.buHaftaSaat || 0));
        const gecenHafta = Math.round(Number(s.gecenHaftaSaat || 0));
        const fark = buHafta - gecenHafta;

        res.json({
            ogrenci_adi: s.ogrenci_adi || "Öğrenci",
            completedCount: s.completedCount || 0,
            buHaftaSaat: buHafta,
            gunlukOrtalama: Math.round((buHafta * 60) / 7),
            haftalikFark: Math.abs(fark),
            durum: fark >= 0 ? "artiş" : "azaliş",
            progressData
        });
    } catch (err) {
        console.error("Dashboard stats hatası:", err.message);
        res.status(500).json({ error: "İstatistikler hesaplanırken hata oluştu." });
    }
};

/* =======================================================
   2. HAFTALIK ÇALIŞMA GRAFİĞİ
======================================================= */
exports.getWeeklyStats = async (req, res) => {
    try {
        const pool = await getConnection();
        const sid = req.user.id;
        const refDate = req.query.date ? new Date(req.query.date) : new Date();

        const result = await pool.request()
            .input('sid', sql.Int, sid)
            .input('refDate', sql.Date, refDate)
            .query(`
                DECLARE @TargetDate DATE = @refDate;
                DECLARE @Weekday INT = DATEPART(WEEKDAY, @TargetDate);
                DECLARE @Monday DATE = DATEADD(
                    DAY,
                    CASE 
                        WHEN @Weekday = 1 THEN -6
                        ELSE 2 - @Weekday
                    END,
                    @TargetDate
                );

                SELECT 
                    T.Tarih,
                    ISNULL(SUM(CASE WHEN d.sinav_kategorisi = 'TYT' THEN c.calisma_suresi_saniye ELSE 0 END), 0) / 3600.0 AS tytSaat,
                    ISNULL(SUM(CASE WHEN d.sinav_kategorisi = 'AYT' THEN c.calisma_suresi_saniye ELSE 0 END), 0) / 3600.0 AS aytSaat
                FROM (
                    SELECT DATEADD(DAY, n, @Monday) AS Tarih
                    FROM (VALUES (0),(1),(2),(3),(4),(5),(6)) AS Numbers(n)
                ) T
                LEFT JOIN dbo.Callisma_kayitlari c
                    ON CAST(c.tarih AS DATE) = T.Tarih
                   AND c.ogrenci_id = @sid
                LEFT JOIN dbo.Dersler d
                    ON c.ders_id = d.ders_id
                GROUP BY T.Tarih
                ORDER BY T.Tarih
            `);

        res.json({
            tyt: result.recordset.map(r => Number(r.tytSaat).toFixed(1)),
            ayt: result.recordset.map(r => Number(r.aytSaat).toFixed(1))
        });
    } catch (err) {
        console.error("Weekly stats hatası:", err.message);
        res.status(500).json({ error: "Haftalık çalışma verisi alınamadı." });
    }
};

/* =======================================================
   3. SON DENEME NETLERİ
======================================================= */
exports.getDenemeStats = async (req, res) => {
    try {
        const pool = await getConnection();
        const sid = req.user.id;

        const tytResult = await pool.request()
            .input('sid', sql.Int, sid)
            .query(`
                SELECT TOP 1
                    SUM(ds.net_sayisi) AS toplam_net
                FROM dbo.Deneme_Takip dt
                JOIN dbo.Deneme_Sonuclari ds ON dt.deneme_id = ds.deneme_id
                WHERE dt.ogrenci_id = @sid
                  AND dt.sinav_kategorisi = 'TYT'
                GROUP BY dt.deneme_id, dt.deneme_tarihi
                ORDER BY dt.deneme_tarihi DESC, dt.deneme_id DESC
            `);

        const aytResult = await pool.request()
            .input('sid', sql.Int, sid)
            .query(`
                SELECT TOP 1
                    SUM(ds.net_sayisi) AS toplam_net
                FROM dbo.Deneme_Takip dt
                JOIN dbo.Deneme_Sonuclari ds ON dt.deneme_id = ds.deneme_id
                WHERE dt.ogrenci_id = @sid
                  AND dt.sinav_kategorisi IN ('SAY', 'EA', 'SOZ')
                GROUP BY dt.deneme_id, dt.deneme_tarihi
                ORDER BY dt.deneme_tarihi DESC, dt.deneme_id DESC
            `);

        res.json({
            tyt: tytResult.recordset[0]?.toplam_net != null
                ? Number(tytResult.recordset[0].toplam_net).toFixed(2)
                : "-",
            ayt: aytResult.recordset[0]?.toplam_net != null
                ? Number(aytResult.recordset[0].toplam_net).toFixed(2)
                : "-"
        });
    } catch (err) {
        console.error("Deneme netleri hatası:", err.message);
        res.status(500).json({ error: "Deneme netleri alınamadı." });
    }
};

/* =======================================================
   4. GÖREV YÖNETİMİ
======================================================= */
exports.getGorevlerByTarih = async (req, res) => {
    const { tarih } = req.params;
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('ogrenci_id', sql.Int, ogrenciId)
            .input('hedef_tarih', sql.Date, tarih)
            .query(`
                SELECT gorev_id, baslik, yapildi_mi
                FROM Gunluk_Gorevler
                WHERE ogrenci_id = @ogrenci_id
                  AND CAST(hedef_tarih AS DATE) = @hedef_tarih
                ORDER BY olusturma_tarihi ASC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error("Görevler alınırken hata oluştu:", err.message);
        res.status(500).json({ error: "Görevler getirilemedi." });
    }
};

exports.addGorev = async (req, res) => {
    const { baslik, hedef_tarih } = req.body;
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        await pool.request()
            .input('ogrenci_id', sql.Int, ogrenciId)
            .input('baslik', sql.VarChar(255), baslik)
            .input('aciklama', sql.VarChar(255), '')
            .input('kategori', sql.VarChar(50), 'KİŞİSEL')
            .input('oncelik_seviyesi', sql.VarChar(20), 'ORTA')
            .input('hedef_tarih', sql.DateTime, hedef_tarih)
            .query(`
                INSERT INTO Gunluk_Gorevler
                (ogrenci_id, baslik, aciklama, kategori, oncelik_seviyesi, olusturma_tarihi, hedef_tarih, yapildi_mi)
                VALUES
                (@ogrenci_id, @baslik, @aciklama, @kategori, @oncelik_seviyesi, GETDATE(), @hedef_tarih, 0)
            `);

        res.json({ success: true, message: "Görev eklendi." });
    } catch (err) {
        console.error("Görev eklenirken hata oluştu:", err.message);
        res.status(500).json({ error: "Görev eklenemedi." });
    }
};

exports.updateGorevStatus = async (req, res) => {
    const { gorevId, yapildi } = req.body;
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();
        const bitValue = (yapildi === true || yapildi === 1) ? 1 : 0;

        await pool.request()
            .input('gorev_id', sql.Int, gorevId)
            .input('ogrenci_id', sql.Int, ogrenciId)
            .input('yapildi_mi', sql.Bit, bitValue)
            .query(`
                UPDATE Gunluk_Gorevler
                SET yapildi_mi = @yapildi_mi
                WHERE gorev_id = @gorev_id AND ogrenci_id = @ogrenci_id
            `);

        res.json({ success: true, message: "Görev durumu güncellendi." });
    } catch (err) {
        console.error("Görev durumu güncellenirken hata oluştu:", err.message);
        res.status(500).json({ error: "Görev durumu güncellenemedi." });
    }
};

exports.deleteGorev = async (req, res) => {
    const { gorevId } = req.body;
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        await pool.request()
            .input('gorev_id', sql.Int, gorevId)
            .input('ogrenci_id', sql.Int, ogrenciId)
            .query(`
                DELETE FROM Gunluk_Gorevler
                WHERE gorev_id = @gorev_id AND ogrenci_id = @ogrenci_id
            `);

        res.json({ success: true, message: "Görev silindi." });
    } catch (err) {
        console.error("Görev silinirken hata oluştu:", err.message);
        res.status(500).json({ error: "Görev silinemedi." });
    }
};