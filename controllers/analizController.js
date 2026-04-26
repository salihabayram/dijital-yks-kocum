const { getConnection } = require('../db');
const sql = require('mssql');

exports.denemeleriListele = async (req, res) => {
    const ogrenciId = req.user.id;

    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('ogrenci_id', sql.Int, ogrenciId)
            .query(`
                SELECT 
                    dt.deneme_id,
                    dt.deneme_adi,
                    dt.deneme_tarihi AS tarih,
                    dt.deneme_turu,
                    dt.sinav_kategorisi,
                    ISNULL(SUM(ds.net_sayisi), 0) AS toplam_net
                FROM Deneme_Takip dt
                LEFT JOIN Deneme_Sonuclari ds
                    ON dt.deneme_id = ds.deneme_id
                WHERE dt.ogrenci_id = @ogrenci_id
                GROUP BY
                    dt.deneme_id,
                    dt.deneme_adi,
                    dt.deneme_tarihi,
                    dt.deneme_turu,
                    dt.sinav_kategorisi
                ORDER BY dt.deneme_tarihi DESC, dt.deneme_id DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Denemeler listelenirken hata oluştu:', err.message);
        res.status(500).json({ error: 'Denemeler listelenemedi.' });
    }
};

exports.denemeDetayiGetir = async (req, res) => {
    const ogrenciId = req.user.id;
    const denemeId = Number(req.params.id);

    if (!Number.isInteger(denemeId) || denemeId <= 0) {
        return res.status(400).json({ error: 'Geçersiz deneme id.' });
    }

    try {
        const pool = await getConnection();

        const denemeResult = await pool.request()
            .input('deneme_id', sql.Int, denemeId)
            .input('ogrenci_id', sql.Int, ogrenciId)
            .query(`
                SELECT 
                    deneme_id,
                    deneme_adi,
                    deneme_tarihi,
                    deneme_turu,
                    sinav_kategorisi
                FROM Deneme_Takip
                WHERE deneme_id = @deneme_id
                  AND ogrenci_id = @ogrenci_id
            `);

        if (denemeResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Deneme bulunamadı.' });
        }

        const derslerResult = await pool.request()
            .input('deneme_id', sql.Int, denemeId)
            .query(`
                SELECT
                    ds.ders_id,
                    d.ders_adi,
                    ds.dogru_sayisi,
                    ds.yanlis_sayisi,
                    CAST(ds.net_sayisi AS DECIMAL(5,2)) AS net_sayisi
                FROM Deneme_Sonuclari ds
                INNER JOIN Dersler d
                    ON ds.ders_id = d.ders_id
                WHERE ds.deneme_id = @deneme_id
                ORDER BY ds.ders_id
            `);

        const toplamNet = derslerResult.recordset.reduce((toplam, ders) => {
            return toplam + Number(ders.net_sayisi);
        }, 0);

        res.json({
            deneme: denemeResult.recordset[0],
            dersler: derslerResult.recordset,
            toplam_net: Number(toplamNet.toFixed(2))
        });
    } catch (err) {
        console.error('Deneme detayı alınırken hata oluştu:', err.message);
        res.status(500).json({ error: 'Deneme detayı alınamadı.' });
    }
};

exports.denemeKaydet = async (req, res) => {
    const ogrenciId = req.user.id;

    const {
        deneme_adi,
        deneme_tarihi,
        deneme_turu,
        sinav_kategorisi,
        sonuclar
    } = req.body;

    const gecerliDenemeTurleri = ['TYT', 'AYT'];
    const gecerliSinavKategorileri = ['TYT', 'SAY', 'EA', 'SOZ'];

    if (!deneme_adi || !deneme_tarihi || !deneme_turu || !sinav_kategorisi) {
        return res.status(400).json({ error: 'Deneme bilgileri eksik.' });
    }

    if (!gecerliDenemeTurleri.includes(deneme_turu)) {
        return res.status(400).json({ error: 'Geçersiz deneme türü.' });
    }

    if (!gecerliSinavKategorileri.includes(sinav_kategorisi)) {
        return res.status(400).json({ error: 'Geçersiz sınav kategorisi.' });
    }

    if (deneme_turu === 'TYT' && sinav_kategorisi !== 'TYT') {
        return res.status(400).json({ error: 'TYT kaydında sınav kategorisi TYT olmalıdır.' });
    }

    if (deneme_turu === 'AYT' && !['SAY', 'EA', 'SOZ'].includes(sinav_kategorisi)) {
        return res.status(400).json({ error: 'AYT kaydında sınav kategorisi SAY, EA veya SOZ olmalıdır.' });
    }

    if (!Array.isArray(sonuclar) || sonuclar.length === 0) {
        return res.status(400).json({ error: 'Ders sonuçları gönderilmedi.' });
    }

    for (const sonuc of sonuclar) {
        if (
            typeof sonuc.ders_id !== 'number' ||
            typeof sonuc.dogru_sayisi !== 'number' ||
            typeof sonuc.yanlis_sayisi !== 'number' ||
            typeof sonuc.net_sayisi !== 'number'
        ) {
            return res.status(400).json({ error: 'Ders sonuç formatı geçersiz.' });
        }

        if (sonuc.dogru_sayisi < 0 || sonuc.yanlis_sayisi < 0) {
            return res.status(400).json({ error: 'Doğru ve yanlış sayıları negatif olamaz.' });
        }
    }

    let transaction;

    try {
        const pool = await getConnection();
        transaction = new sql.Transaction(pool);

        await transaction.begin();

        const denemeEkleResult = await new sql.Request(transaction)
            .input('ogrenci_id', sql.Int, ogrenciId)
            .input('deneme_adi', sql.VarChar(100), deneme_adi.trim())
            .input('deneme_tarihi', sql.Date, deneme_tarihi)
            .input('deneme_turu', sql.VarChar(20), deneme_turu)
            .input('sinav_kategorisi', sql.VarChar(10), sinav_kategorisi)
            .query(`
                INSERT INTO Deneme_Takip
                (ogrenci_id, deneme_adi, deneme_tarihi, deneme_turu, sinav_kategorisi)
                OUTPUT INSERTED.deneme_id
                VALUES
                (@ogrenci_id, @deneme_adi, @deneme_tarihi, @deneme_turu, @sinav_kategorisi)
            `);

        const denemeId = denemeEkleResult.recordset[0].deneme_id;

        for (const sonuc of sonuclar) {
            await new sql.Request(transaction)
                .input('deneme_id', sql.Int, denemeId)
                .input('ders_id', sql.Int, sonuc.ders_id)
                .input('dogru_sayisi', sql.Int, sonuc.dogru_sayisi)
                .input('yanlis_sayisi', sql.Int, sonuc.yanlis_sayisi)
                .input('net_sayisi', sql.Decimal(5, 2), sonuc.net_sayisi)
                .query(`
                    INSERT INTO Deneme_Sonuclari
                    (deneme_id, ders_id, dogru_sayisi, yanlis_sayisi, net_sayisi)
                    VALUES
                    (@deneme_id, @ders_id, @dogru_sayisi, @yanlis_sayisi, @net_sayisi)
                `);
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Deneme kaydedildi.',
            deneme_id: denemeId
        });
    } catch (err) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error('Rollback hatası:', rollbackErr.message);
            }
        }

        console.error('Deneme kaydedilirken hata oluştu:', err.message);
        res.status(500).json({ error: 'Deneme kaydedilemedi.' });
    }
};

exports.denemeSil = async (req, res) => {
    const ogrenciId = req.user.id;
    const denemeId = Number(req.params.id);

    if (!Number.isInteger(denemeId) || denemeId <= 0) {
        return res.status(400).json({ error: 'Geçersiz deneme id.' });
    }

    let transaction;

    try {
        const pool = await getConnection();
        transaction = new sql.Transaction(pool);

        await transaction.begin();

        const denemeKontrol = await new sql.Request(transaction)
            .input('deneme_id', sql.Int, denemeId)
            .input('ogrenci_id', sql.Int, ogrenciId)
            .query(`
                SELECT deneme_id
                FROM Deneme_Takip
                WHERE deneme_id = @deneme_id
                  AND ogrenci_id = @ogrenci_id
            `);

        if (denemeKontrol.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Silinecek deneme bulunamadı.' });
        }

        await new sql.Request(transaction)
            .input('deneme_id', sql.Int, denemeId)
            .query(`
                DELETE FROM Deneme_Sonuclari
                WHERE deneme_id = @deneme_id
            `);

        await new sql.Request(transaction)
            .input('deneme_id', sql.Int, denemeId)
            .input('ogrenci_id', sql.Int, ogrenciId)
            .query(`
                DELETE FROM Deneme_Takip
                WHERE deneme_id = @deneme_id
                  AND ogrenci_id = @ogrenci_id
            `);

        await transaction.commit();

        res.json({ success: true, message: 'Deneme silindi.' });
    } catch (err) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error('Rollback hatası:', rollbackErr.message);
            }
        }

        console.error('Deneme silinirken hata oluştu:', err.message);
        res.status(500).json({ error: 'Deneme silinemedi.' });
    }
};