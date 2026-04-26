let currentSubjectId = null;
const token = localStorage.getItem('token');

/* 1. SAYFA YÜKLENDİĞİNDE BAŞLATICI */
document.addEventListener("DOMContentLoaded", () => {
    // Sayfa ilk açıldığında TYT butonunu aktif et ve dersleri getir
    const firstTab = document.querySelector(".exam-tab.active") || document.querySelector(".exam-tab");
    if (firstTab) {
        // İlk açılışta TYT kategorisini yükle
        filterExam('TYT', firstTab);
    }
});

/* 2. SINAV TÜRÜNE GÖRE DERSLERİ FİLTRELE */
async function filterExam(kategori, element) {
    try {
        // Tüm sekmelerden active sınıfını temizle
        document.querySelectorAll(".exam-tab").forEach(btn => {
            btn.classList.remove("active");
        });

        // Tıklanan sınav türünü aktif yap
        if (element) {
            element.classList.add("active");
        }

        // Kategori ismini parçala AYT SAY olarak
        const parts = kategori.split('-');
        const anaKategori = parts[0];
        const altAlan = parts[1];

        // Veritabanından ana kategoriye göre dersleri çek
        const response = await fetch(`http://localhost:3000/api/konu/dersler/${anaKategori}`);
        if (!response.ok) throw new Error("Dersler çekilemedi");
        let dersler = await response.json();

        // Eğer AYT seçildiyse, alan filtrelemesi yap
        if (anaKategori === "AYT" && altAlan) {
            dersler = dersler.filter(ders => {
                if (altAlan === "SAY") return ders.dersin_alani === "Sayisal";
                if (altAlan === "EA") return ders.dersin_alani === "Esit Agirlik";
                if (altAlan === "SOZ") return ders.dersin_alani === "Sözel";
                return true;
            });
        }

        const dersListesi = document.getElementById("dersListesi");
        if (!dersler.length) {
            dersListesi.innerHTML = "<p class='empty-msg'>Bu alanda ders bulunamadı.</p>";
            document.getElementById("konuListesi").innerHTML = "";
            updateProgressBar([]);
            return;
        }

        // Ders butonlarını oluştur
        dersListesi.innerHTML = dersler.map(ders => `
 <button 
class="ders-btn" 
id="ders-${ders.ders_id}" 
 onclick="fetchKonular(${ders.ders_id})">
${ders.ders_adi}
 </button>
 `).join("");

        // İlk dersin konularını otomatik getir
        fetchKonular(dersler[0].ders_id);

    } catch (err) {
        console.error("Ders yükleme hatası:", err);
    }
}

/*  SEÇİLEN DERSE AİT KONULARI GETİR (TİKLERİ HATIRLAR) */
/*  SEÇİLEN DERSE AİT KONULARI GETİR (TİKLERİ HATIRLAR) */
async function fetchKonular(dersId) {
    currentSubjectId = dersId;

    // Token'ı her zaman güncel haliyle alıyoruz
    const token = localStorage.getItem('token');

    try {
        // Aktif ders butonunu vurgula
        document.querySelectorAll(".ders-btn").forEach(btn => btn.classList.remove("active"));
        const targetBtn = document.getElementById(`ders-${dersId}`);
        if (targetBtn) targetBtn.classList.add("active");

        const response = await fetch(`http://localhost:3000/api/konu/konular/${dersId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) alert("Oturumunuz dolmuş, lütfen tekrar giriş yapın.");
            throw new Error("Konular çekilemedi");
        }

        const konular = await response.json();
        const grid = document.getElementById("konuListesi");

        if (!konular.length) {
            grid.innerHTML = "<div class='empty-state'>Bu derse ait henüz konu eklenmemiş.</div>";
            updateProgressBar([]);
            return;
        }

        // BURASI EKLENDİ: Konuları ekrana basan döngü
        grid.innerHTML = konular.map(k => {
            const isDone = (k.tamamlandi_mi == 1 || k.tamamlandi_mi == true);
            return `
                <div class="topic-card ${isDone ? 'completed' : ''}" id="card-${k.konu_id}">
                    <input type="checkbox" 
                        ${isDone ? "checked" : ""} 
                        onchange="updateTopicStatus(${k.konu_id}, this.checked)">
                    <span>${k.konu_adi}</span>
                </div>
            `;
        }).join("");

        updateProgressBar(konular);

    } catch (err) {
        console.error("Konu yükleme hatası:", err);
    }
}

// KONU DURUMUNU VERİTABANINDA GÜNCELLE */



async function updateTopicStatus(konuId, durum) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch("http://localhost:3000/api/konu/guncelle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // BURASI EKSİK OLAN KISIM TOKEN KONTROLUNU GUNCELLİCEM BURDA HATA VERİYO
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                konuId: konuId,
                tamamlandi: durum
            })
        });

        if (res.ok) {
            // Kartın görselini değiştir 
            const card = document.getElementById(`card-${konuId}`);
            if (card) {
                card.classList.toggle("completed", durum);
            }

            // Tebrik bildirimi gönderme kısmı
            if (durum) {
                showToast("Tebrikler! Bir konuyu daha fethettin. 🔥");
            }

            // İlerleme barını anlık güncellemek için ekrandaki tüm checkbox'ları saydırma işlemi
            const allCheckboxes = Array.from(document.querySelectorAll("#konuListesi input[type='checkbox']"));
            const currentStatus = allCheckboxes.map(cb => ({ tamamlandi_mi: cb.checked }));
            updateProgressBar(currentStatus);
        } else {
            alert("Durum güncellenemedi, lütfen tekrar deneyin.");
        }
    } catch (err) {
        console.error("Güncelleme hatası:", err);
    }
}

//  İLERLEME ÇUBUĞUNU HESAPLA 
function updateProgressBar(konular) {
    const total = konular.length;
    // Hem true hem de 1 değerlerini sayar seklinde duzeltme yaptım burda her ihtimal için
    const completed = konular.filter(k => k.tamamlandi_mi == true || k.tamamlandi_mi == 1).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const bar = document.getElementById("mainProgressBar");
    const text = document.getElementById("totalPercent");

    if (bar) {
        bar.style.width = percent + "%";
    }
    if (text) {
        text.innerText = percent + "%";
    }
}

//  TEBRİK BİLDİRİMİ TOAST ŞEKLİNDE 
function showToast(mesaj) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${mesaj}</span>`;

    container.appendChild(toast);

    // Animasyonla yok et
    setTimeout(() => {
        toast.style.animation = "fadeOut 0.5s ease forwards";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}