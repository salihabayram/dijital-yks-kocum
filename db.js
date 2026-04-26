

const sql = require('mssql');

const config = require('./dbconfig');



// Bağlantı havuzunu dışarıdan erişilebilir bir değişken yapar

let pool;



async function getConnection() {

    if (pool) return pool; // Eğer zaten bağlıysa mevcut havuzu döndürür

    //



    try {

        pool = await sql.connect(config);

        console.log('Dijital YKS Koçu Veritabanına Bağlanıldı! ✅');

        return pool;

    } catch (err) {

        console.error('Veritabanı Bağlantı Hatası: ', err);

        throw err;

    }

}



module.exports = {

    sql,

    getConnection

};