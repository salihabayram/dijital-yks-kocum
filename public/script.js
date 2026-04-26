document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const sifre = document.getElementById('sifre').value;
    const confirmSifre = document.getElementById('confirmSifre').value;

    if (sifre !== confirmSifre) {
        alert("Şifreler uyuşmuyor!");
        return;
    }

    const payload = {
        ad: document.getElementById('ad').value,
        soyad: "YKS Öğrencisi", 
        email: document.getElementById('email').value,
        sifre: sifre,
        // diğer alanlar için varsayılan değerler olarak dursun sonra ogrenci kendi kaydedicek şekilde ayarlicaz
        hedef_bolum: "Belirtilmedi",
        telefon_no: "05000000000",
        dogum_gunu: "2007-01-01",
        cinsiyet: document.getElementById('cinsiyet').value,// bunu da zorunlu olacak şekilde aldık
        city: "Belirtilmedi",
        lise_adi: "Belirtilmedi",
        mezuniyet_yili: 2026,
        diploma_notu: 0
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Başarıyla kayıt oldun! Giriş sayfasına gidiliyor.");
            window.location.href = 'login.html';
        } else {
            const error = await response.text();
            alert("Kayıt sırasında hata oluştu: " + error);
        }
    } catch (err) {
        console.error("Hata:", err);
        alert("Sunucuya bağlanılamadı.");
    }
});