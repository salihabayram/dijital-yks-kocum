const API_BASE_URL = "http://localhost:3000/api/analiz";

const tytTabBtn = document.getElementById("tytTabBtn");
const aytTabBtn = document.getElementById("aytTabBtn");

const tytTabContent = document.getElementById("tytTabContent");
const aytTabContent = document.getElementById("aytTabContent");

const aytAlanSecimi = document.getElementById("aytAlanSecimi");
const sayisalAlan = document.getElementById("sayisalAlan");
const esitAgirlikAlan = document.getElementById("esitAgirlikAlan");
const sozelAlan = document.getElementById("sozelAlan");

const tytToplamNetAlani = document.getElementById("tytToplamNet");
const aytToplamNetAlani = document.getElementById("aytToplamNet");

const tytKaydetBtn = document.getElementById("tytKaydetBtn");
const aytKaydetBtn = document.getElementById("aytKaydetBtn");

const denemeGecmisiBody = document.getElementById("denemeGecmisiBody");

const denemeDetayModal = document.getElementById("denemeDetayModal");
const denemeDetayKapatBtn = document.getElementById("denemeDetayKapatBtn");
const denemeDetayBaslik = document.getElementById("denemeDetayBaslik");
const denemeDetayMeta = document.getElementById("denemeDetayMeta");
const denemeDetayOzet = document.getElementById("denemeDetayOzet");
const denemeDetayBody = document.getElementById("denemeDetayBody");

const DERS_IDLERI = {
    tytTurkce: 12,
    tytMatematik: 13,
    tytFizik: 15,
    tytKimya: 16,
    tytBiyoloji: 17,
    tytTarih: 18,
    tytCografya: 19,
    tytFelsefe: 20,
    tytDin: 21,

    aytMatematik: 22,
    aytFizik: 24,
    aytKimya: 25,
    aytBiyoloji: 26,
    aytEdebiyat: 27,
    aytTarih1: 28,
    aytCografya1: 29,
    aytTarih2: 30,
    aytCografya2: 31,
    aytFelsefeGrubu: 32
};

let denemeKayitlari = [];

function tokenAl() {
    return localStorage.getItem("token");
}

function girisKontrolu() {
    const token = tokenAl();

    if (!token) {
        alert("Lütfen önce giriş yap.");
        window.location.href = "index.html";
        return false;
    }

    return true;
}

function authHeaders(jsonIcerik = false) {
    const token = tokenAl();

    const headers = {
        "Authorization": `Bearer ${token}`
    };

    if (jsonIcerik) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

function sekmeGoster(sekme) {
    if (sekme === "tyt") {
        tytTabBtn.classList.add("aktif");
        aytTabBtn.classList.remove("aktif");
        tytTabContent.classList.add("aktif");
        aytTabContent.classList.remove("aktif");
    } else {
        aytTabBtn.classList.add("aktif");
        tytTabBtn.classList.remove("aktif");
        aytTabContent.classList.add("aktif");
        tytTabContent.classList.remove("aktif");
    }
}

tytTabBtn.addEventListener("click", () => sekmeGoster("tyt"));
aytTabBtn.addEventListener("click", () => sekmeGoster("ayt"));

function aytAlanlariniGizle() {
    sayisalAlan.classList.remove("aktif-alan");
    esitAgirlikAlan.classList.remove("aktif-alan");
    sozelAlan.classList.remove("aktif-alan");
}

function aytAlanGoster() {
    aytAlanlariniGizle();

    const secilenAlan = aytAlanSecimi.value;

    if (secilenAlan === "sayisal") {
        sayisalAlan.classList.add("aktif-alan");
    } else if (secilenAlan === "esitAgirlik") {
        esitAgirlikAlan.classList.add("aktif-alan");
    } else if (secilenAlan === "sozel") {
        sozelAlan.classList.add("aktif-alan");
    }

    aytNetHesapla();
}

aytAlanSecimi.addEventListener("change", aytAlanGoster);

function sonucNesnesiOlustur(ders_id, dogru, yanlis) {
    dogru = Number(dogru) || 0;
    yanlis = Number(yanlis) || 0;

    return {
        ders_id,
        dogru_sayisi: dogru,
        yanlis_sayisi: yanlis,
        net_sayisi: Number((dogru - yanlis / 4).toFixed(2))
    };
}

function bosOlmayanSonuclariGetir(sonuclar) {
    return sonuclar.filter((sonuc) =>
        sonuc.dogru_sayisi > 0 || sonuc.yanlis_sayisi > 0
    );
}

function inputDegeriAl(id) {
    const eleman = document.getElementById(id);
    if (!eleman) return 0;

    const deger = Number(eleman.value);
    return isNaN(deger) ? 0 : deger;
}

function netHesapla(dogru, yanlis) {
    return dogru - (yanlis / 4);
}

function sayiYuvarla(sayi) {
    return Number(sayi.toFixed(2));
}

function tarihFormatla(tarihDegeri) {
    if (!tarihDegeri) return "-";

    const yalnizTarih = String(tarihDegeri).split("T")[0];
    const parcalar = yalnizTarih.split("-");

    if (parcalar.length !== 3) return tarihDegeri;

    return `${parcalar[2]}.${parcalar[1]}.${parcalar[0]}`;
}

function tarihiGosterimFormatinaCevir(isoTarih) {
    if (!isoTarih) return "gg.aa.yyyy";

    const [yil, ay, gun] = isoTarih.split("-");
    return `${gun}.${ay}.${yil}`;
}

function bugununIsoTarihi() {
    const bugun = new Date();
    const yil = bugun.getFullYear();
    const ay = String(bugun.getMonth() + 1).padStart(2, "0");
    const gun = String(bugun.getDate()).padStart(2, "0");
    return `${yil}-${ay}-${gun}`;
}

function tytNetHesapla() {
    const toplamNet =
        netHesapla(inputDegeriAl("tytTurkceDogru"), inputDegeriAl("tytTurkceYanlis")) +
        netHesapla(inputDegeriAl("tytMatDogru"), inputDegeriAl("tytMatYanlis")) +
        netHesapla(inputDegeriAl("tytTarihDogru"), inputDegeriAl("tytTarihYanlis")) +
        netHesapla(inputDegeriAl("tytCografyaDogru"), inputDegeriAl("tytCografyaYanlis")) +
        netHesapla(inputDegeriAl("tytFelsefeDogru"), inputDegeriAl("tytFelsefeYanlis")) +
        netHesapla(inputDegeriAl("tytDinDogru"), inputDegeriAl("tytDinYanlis")) +
        netHesapla(inputDegeriAl("tytFizikDogru"), inputDegeriAl("tytFizikYanlis")) +
        netHesapla(inputDegeriAl("tytKimyaDogru"), inputDegeriAl("tytKimyaYanlis")) +
        netHesapla(inputDegeriAl("tytBiyolojiDogru"), inputDegeriAl("tytBiyolojiYanlis"));

    const yuvarlanmis = sayiYuvarla(toplamNet);
    tytToplamNetAlani.textContent = yuvarlanmis.toFixed(2);

    return yuvarlanmis;
}

function aytNetHesapla() {
    const secilenAlan = aytAlanSecimi.value;
    let toplamNet = 0;

    if (secilenAlan === "sayisal") {
        toplamNet =
            netHesapla(inputDegeriAl("sayisalMatDogru"), inputDegeriAl("sayisalMatYanlis")) +
            netHesapla(inputDegeriAl("sayisalFizikDogru"), inputDegeriAl("sayisalFizikYanlis")) +
            netHesapla(inputDegeriAl("sayisalKimyaDogru"), inputDegeriAl("sayisalKimyaYanlis")) +
            netHesapla(inputDegeriAl("sayisalBiyolojiDogru"), inputDegeriAl("sayisalBiyolojiYanlis"));
    } else if (secilenAlan === "esitAgirlik") {
        toplamNet =
            netHesapla(inputDegeriAl("eaMatDogru"), inputDegeriAl("eaMatYanlis")) +
            netHesapla(inputDegeriAl("eaEdebiyatDogru"), inputDegeriAl("eaEdebiyatYanlis")) +
            netHesapla(inputDegeriAl("eaTarih1Dogru"), inputDegeriAl("eaTarih1Yanlis")) +
            netHesapla(inputDegeriAl("eaCografya1Dogru"), inputDegeriAl("eaCografya1Yanlis"));
    } else if (secilenAlan === "sozel") {
        toplamNet =
            netHesapla(inputDegeriAl("sozelEdebiyatDogru"), inputDegeriAl("sozelEdebiyatYanlis")) +
            netHesapla(inputDegeriAl("sozelTarih1Dogru"), inputDegeriAl("sozelTarih1Yanlis")) +
            netHesapla(inputDegeriAl("sozelCografya1Dogru"), inputDegeriAl("sozelCografya1Yanlis")) +
            netHesapla(inputDegeriAl("sozelTarih2Dogru"), inputDegeriAl("sozelTarih2Yanlis")) +
            netHesapla(inputDegeriAl("sozelCografya2Dogru"), inputDegeriAl("sozelCografya2Yanlis")) +
            netHesapla(inputDegeriAl("sozelFelsefeDogru"), inputDegeriAl("sozelFelsefeYanlis"));
    }

    toplamNet = sayiYuvarla(toplamNet);
    aytToplamNetAlani.textContent = toplamNet.toFixed(2);

    return toplamNet;
}

function tumInputlaraDinleyiciEkle() {
    const tumSayiInputlari = document.querySelectorAll('input[type="number"]');

    tumSayiInputlari.forEach((input) => {
        input.addEventListener("input", () => {
            tytNetHesapla();
            aytNetHesapla();
        });
    });
}

function inputGorunurMu(eleman) {
    if (!eleman) return false;

    return eleman.offsetParent !== null &&
        !eleman.disabled &&
        !eleman.readOnly;
}

function enterIleSonrakiInputaGec() {
    const tumSayiInputlari = Array.from(document.querySelectorAll('input[type="number"]'));

    tumSayiInputlari.forEach((input, index) => {
        input.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;

            event.preventDefault();

            for (let i = index + 1; i < tumSayiInputlari.length; i++) {
                const siradakiInput = tumSayiInputlari[i];

                if (inputGorunurMu(siradakiInput)) {
                    siradakiInput.focus();
                    siradakiInput.select();
                    return;
                }
            }
        });
    });
}

function dersKontroluYap(dersAdi, dogru, yanlis, soruSayisi) {
    if (dogru < 0 || yanlis < 0) {
        return `${dersAdi} için doğru ve yanlış negatif olamaz.`;
    }

    if (dogru + yanlis > soruSayisi) {
        return `${dersAdi} için doğru + yanlış toplamı ${soruSayisi} soruyu geçemez.`;
    }

    return null;
}

function tytSonucKontrolu() {
    const kontroller = [
        dersKontroluYap("Türkçe", inputDegeriAl("tytTurkceDogru"), inputDegeriAl("tytTurkceYanlis"), 40),
        dersKontroluYap("Temel Matematik", inputDegeriAl("tytMatDogru"), inputDegeriAl("tytMatYanlis"), 40),
        dersKontroluYap("Tarih", inputDegeriAl("tytTarihDogru"), inputDegeriAl("tytTarihYanlis"), 5),
        dersKontroluYap("Coğrafya", inputDegeriAl("tytCografyaDogru"), inputDegeriAl("tytCografyaYanlis"), 5),
        dersKontroluYap("Felsefe", inputDegeriAl("tytFelsefeDogru"), inputDegeriAl("tytFelsefeYanlis"), 5),
        dersKontroluYap("Din Kültürü", inputDegeriAl("tytDinDogru"), inputDegeriAl("tytDinYanlis"), 5),
        dersKontroluYap("Fizik", inputDegeriAl("tytFizikDogru"), inputDegeriAl("tytFizikYanlis"), 7),
        dersKontroluYap("Kimya", inputDegeriAl("tytKimyaDogru"), inputDegeriAl("tytKimyaYanlis"), 7),
        dersKontroluYap("Biyoloji", inputDegeriAl("tytBiyolojiDogru"), inputDegeriAl("tytBiyolojiYanlis"), 6)
    ];

    return kontroller.find((hata) => hata !== null) || null;
}

function aytSonucKontrolu(alanTuru) {
    let kontroller = [];

    if (alanTuru === "sayisal") {
        kontroller = [
            dersKontroluYap("Matematik", inputDegeriAl("sayisalMatDogru"), inputDegeriAl("sayisalMatYanlis"), 40),
            dersKontroluYap("Fizik", inputDegeriAl("sayisalFizikDogru"), inputDegeriAl("sayisalFizikYanlis"), 14),
            dersKontroluYap("Kimya", inputDegeriAl("sayisalKimyaDogru"), inputDegeriAl("sayisalKimyaYanlis"), 13),
            dersKontroluYap("Biyoloji", inputDegeriAl("sayisalBiyolojiDogru"), inputDegeriAl("sayisalBiyolojiYanlis"), 13)
        ];
    } else if (alanTuru === "esitAgirlik") {
        kontroller = [
            dersKontroluYap("Matematik", inputDegeriAl("eaMatDogru"), inputDegeriAl("eaMatYanlis"), 40),
            dersKontroluYap("Edebiyat", inputDegeriAl("eaEdebiyatDogru"), inputDegeriAl("eaEdebiyatYanlis"), 24),
            dersKontroluYap("Tarih-1", inputDegeriAl("eaTarih1Dogru"), inputDegeriAl("eaTarih1Yanlis"), 10),
            dersKontroluYap("Coğrafya-1", inputDegeriAl("eaCografya1Dogru"), inputDegeriAl("eaCografya1Yanlis"), 6)
        ];
    } else if (alanTuru === "sozel") {
        kontroller = [
            dersKontroluYap("Edebiyat", inputDegeriAl("sozelEdebiyatDogru"), inputDegeriAl("sozelEdebiyatYanlis"), 24),
            dersKontroluYap("Tarih-1", inputDegeriAl("sozelTarih1Dogru"), inputDegeriAl("sozelTarih1Yanlis"), 10),
            dersKontroluYap("Coğrafya-1", inputDegeriAl("sozelCografya1Dogru"), inputDegeriAl("sozelCografya1Yanlis"), 6),
            dersKontroluYap("Tarih-2", inputDegeriAl("sozelTarih2Dogru"), inputDegeriAl("sozelTarih2Yanlis"), 11),
            dersKontroluYap("Coğrafya-2", inputDegeriAl("sozelCografya2Dogru"), inputDegeriAl("sozelCografya2Yanlis"), 11),
            dersKontroluYap("Felsefe Grubu", inputDegeriAl("sozelFelsefeDogru"), inputDegeriAl("sozelFelsefeYanlis"), 12)
        ];
    }

    return kontroller.find((hata) => hata !== null) || null;
}

function formuTemizle(formTuru) {
    if (formTuru === "TYT") {
        document.getElementById("tytDenemeAdi").value = "";
        document.getElementById("tytTarih").value = "";
        document.getElementById("tytTarihText").textContent = "gg.aa.yyyy";
        document.getElementById("tytTarihText").classList.add("placeholder");

        [
            "tytTurkceDogru", "tytTurkceYanlis",
            "tytMatDogru", "tytMatYanlis",
            "tytTarihDogru", "tytTarihYanlis",
            "tytCografyaDogru", "tytCografyaYanlis",
            "tytFelsefeDogru", "tytFelsefeYanlis",
            "tytDinDogru", "tytDinYanlis",
            "tytFizikDogru", "tytFizikYanlis",
            "tytKimyaDogru", "tytKimyaYanlis",
            "tytBiyolojiDogru", "tytBiyolojiYanlis"
        ].forEach((id) => {
            const eleman = document.getElementById(id);
            if (eleman) eleman.value = "";
        });

        tytToplamNetAlani.textContent = "0.00";
    } else {
        document.getElementById("aytDenemeAdi").value = "";
        document.getElementById("aytTarih").value = "";
        document.getElementById("aytTarihText").textContent = "gg.aa.yyyy";
        document.getElementById("aytTarihText").classList.add("placeholder");

        document.getElementById("aytAlanSecimi").value = "";
        document.getElementById("aytAlanText").textContent = "ALAN SEÇİN";
        document.getElementById("aytAlanText").classList.add("placeholder");
        aytAlanGoster();

        document.querySelectorAll("#aytTabContent input[type='number']").forEach((input) => {
            input.value = "";
        });

        aytToplamNetAlani.textContent = "0.00";
    }
}

function detayModalAc() {
    denemeDetayModal.classList.remove("hidden");
}

function detayModalKapat() {
    denemeDetayModal.classList.add("hidden");
}

function denemeDetayiniRenderEt(data) {
    const { deneme, dersler, toplam_net } = data;

    denemeDetayBaslik.textContent = deneme.deneme_adi;
    denemeDetayMeta.textContent = `${tarihFormatla(deneme.deneme_tarihi)} • ${deneme.deneme_turu} • ${deneme.sinav_kategorisi}`;

    denemeDetayOzet.innerHTML = `
        <div class="detay-ozet-karti">
            <div class="detay-ozet-baslik">Toplam Net</div>
            <div class="detay-ozet-deger">${Number(toplam_net).toFixed(2)}</div>
        </div>
        <div class="detay-ozet-karti">
            <div class="detay-ozet-baslik">Tür</div>
            <div class="detay-ozet-deger">${deneme.deneme_turu}</div>
        </div>
        <div class="detay-ozet-karti">
            <div class="detay-ozet-baslik">Kategori</div>
            <div class="detay-ozet-deger">${deneme.sinav_kategorisi}</div>
        </div>
        <div class="detay-ozet-karti">
            <div class="detay-ozet-baslik">Ders Sayısı</div>
            <div class="detay-ozet-deger">${dersler.length}</div>
        </div>
    `;

    denemeDetayBody.innerHTML = "";

    dersler.forEach((ders) => {
        const satir = document.createElement("tr");
        satir.innerHTML = `
            <td>${ders.ders_adi}</td>
            <td>${ders.dogru_sayisi}</td>
            <td>${ders.yanlis_sayisi}</td>
            <td>${Number(ders.net_sayisi).toFixed(2)}</td>
        `;
        denemeDetayBody.appendChild(satir);
    });
}

async function denemeDetayiniGetir(denemeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${denemeId}`, {
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Deneme detayı alınamadı.");
            return;
        }

        denemeDetayiniRenderEt(data);
        detayModalAc();
    } catch (error) {
        console.error("Deneme detayı alma hatası:", error);
        alert("Sunucuya ulaşılamadı.");
    }
}

function tabloyuRenderEt() {
    denemeGecmisiBody.innerHTML = "";

    denemeKayitlari.forEach((kayit) => {
        const satir = document.createElement("tr");

        satir.innerHTML = `
            <td>${tarihFormatla(kayit.tarih)}</td>
            <td>${kayit.deneme_adi}</td>
            <td>${kayit.deneme_turu}</td>
            <td>${Number(kayit.toplam_net).toFixed(2)}</td>
            <td>
                <div class="islem-btn-grup">
                    <button class="incele-btn" data-id="${kayit.deneme_id}">İncele</button>
                    <button class="sil-btn" data-id="${kayit.deneme_id}">🗑️</button>
                </div>
            </td>
        `;

        denemeGecmisiBody.appendChild(satir);
    });

    document.querySelectorAll(".incele-btn").forEach((buton) => {
        buton.addEventListener("click", async () => {
            const denemeId = Number(buton.dataset.id);
            await denemeDetayiniGetir(denemeId);
        });
    });

    document.querySelectorAll(".sil-btn").forEach((buton) => {
        buton.addEventListener("click", async () => {
            const denemeId = Number(buton.dataset.id);

            if (!confirm("Bu denemeyi silmek istediğine emin misin?")) {
                return;
            }

            await denemeSil(denemeId);
        });
    });
}

async function denemeleriGetir() {
    try {
        const response = await fetch(`${API_BASE_URL}/liste`, {
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Denemeler alınamadı:", data.error || data.message);
            return;
        }

        denemeKayitlari = data;
        tabloyuRenderEt();
        grafigiGuncelle();
    } catch (error) {
        console.error("Deneme listeleme hatası:", error);
    }
}

async function denemeKaydet(veri) {
    try {
        const response = await fetch(`${API_BASE_URL}/kaydet`, {
            method: "POST",
            headers: authHeaders(true),
            body: JSON.stringify(veri)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Deneme kaydedilemedi:", data.error || data.message);
            alert(data.error || "Deneme kaydedilemedi.");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Deneme kayıt hatası:", error);
        alert("Sunucuya ulaşılamadı.");
        return false;
    }
}

async function denemeSil(denemeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${denemeId}`, {
            method: "DELETE",
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Deneme silinemedi:", data.error || data.message);
            alert(data.error || "Deneme silinemedi.");
            return;
        }

        await denemeleriGetir();
    } catch (error) {
        console.error("Deneme silme hatası:", error);
        alert("Silme işlemi sırasında sunucuya ulaşılamadı.");
    }
}

function customDatePickerKurulum(prefix) {
    const hiddenInput = document.getElementById(`${prefix}Tarih`);
    const trigger = document.getElementById(`${prefix}TarihTrigger`);
    const text = document.getElementById(`${prefix}TarihText`);
    const popup = document.getElementById(`${prefix}TarihPopup`);
    const title = document.getElementById(`${prefix}AyYil`);
    const grid = document.getElementById(`${prefix}TarihGrid`);
    const prevBtn = document.getElementById(`${prefix}PrevAy`);
    const nextBtn = document.getElementById(`${prefix}NextAy`);
    const todayBtn = document.getElementById(`${prefix}BugunBtn`);
    const clearBtn = document.getElementById(`${prefix}TemizleBtn`);

    const aylar = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    let gorunenAy;
    let gorunenYil;

    function seciliTarihiGetir() {
        return hiddenInput.value || "";
    }

    function seciliTarihiAyarla(isoTarih) {
        hiddenInput.value = isoTarih;
        text.textContent = isoTarih ? tarihiGosterimFormatinaCevir(isoTarih) : "gg.aa.yyyy";
        text.classList.toggle("placeholder", !isoTarih);
    }

    function popupAc() {
        document.querySelectorAll(".custom-date-popup.aktif").forEach((el) => {
            if (el !== popup) el.classList.remove("aktif");
        });
        document.querySelectorAll(".custom-select-popup.aktif").forEach((el) => {
            el.classList.remove("aktif");
        });

        const secili = seciliTarihiGetir();
        const kaynakTarih = secili ? new Date(secili) : new Date();

        gorunenAy = kaynakTarih.getMonth();
        gorunenYil = kaynakTarih.getFullYear();

        takvimiRenderEt();
        popup.classList.add("aktif");
    }

    function popupKapat() {
        popup.classList.remove("aktif");
    }

    function takvimiRenderEt() {
        title.textContent = `${aylar[gorunenAy]} ${gorunenYil}`;
        grid.innerHTML = "";

        const ilkGun = new Date(gorunenYil, gorunenAy, 1);
        let haftaninGunu = ilkGun.getDay();
        haftaninGunu = haftaninGunu === 0 ? 6 : haftaninGunu - 1;

        const ayinGunSayisi = new Date(gorunenYil, gorunenAy + 1, 0).getDate();
        const oncekiAyinGunSayisi = new Date(gorunenYil, gorunenAy, 0).getDate();

        const secili = seciliTarihiGetir();
        const bugunIso = bugununIsoTarihi();

        for (let i = haftaninGunu - 1; i >= 0; i--) {
            const gun = oncekiAyinGunSayisi - i;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "date-day-btn pasif";
            btn.textContent = gun;
            grid.appendChild(btn);
        }

        for (let gun = 1; gun <= ayinGunSayisi; gun++) {
            const isoTarih = `${gorunenYil}-${String(gorunenAy + 1).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "date-day-btn";
            btn.textContent = gun;

            if (isoTarih === bugunIso) btn.classList.add("bugun");
            if (isoTarih === secili) btn.classList.add("secili");

            btn.addEventListener("click", () => {
                seciliTarihiAyarla(isoTarih);
                popupKapat();
            });

            grid.appendChild(btn);
        }

        const toplamHucre = haftaninGunu + ayinGunSayisi;
        const kalanHucre = toplamHucre % 7 === 0 ? 0 : 7 - (toplamHucre % 7);

        for (let gun = 1; gun <= kalanHucre; gun++) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "date-day-btn pasif";
            btn.textContent = gun;
            grid.appendChild(btn);
        }
    }

    trigger.addEventListener("click", () => {
        if (popup.classList.contains("aktif")) {
            popupKapat();
        } else {
            popupAc();
        }
    });

    prevBtn.addEventListener("click", () => {
        gorunenAy--;
        if (gorunenAy < 0) {
            gorunenAy = 11;
            gorunenYil--;
        }
        takvimiRenderEt();
    });

    nextBtn.addEventListener("click", () => {
        gorunenAy++;
        if (gorunenAy > 11) {
            gorunenAy = 0;
            gorunenYil++;
        }
        takvimiRenderEt();
    });

    todayBtn.addEventListener("click", () => {
        seciliTarihiAyarla(bugununIsoTarihi());
        popupKapat();
    });

    clearBtn.addEventListener("click", () => {
        seciliTarihiAyarla("");
        popupKapat();
    });

    document.addEventListener("click", (event) => {
        if (!popup.contains(event.target) && !trigger.contains(event.target)) {
            popupKapat();
        }
    });

    seciliTarihiAyarla("");
}

function customSelectKurulum() {
    const hiddenSelect = document.getElementById("aytAlanSecimi");
    const trigger = document.getElementById("aytAlanTrigger");
    const text = document.getElementById("aytAlanText");
    const popup = document.getElementById("aytAlanPopup");
    const options = popup.querySelectorAll(".custom-select-option");

    function popupAc() {
        document.querySelectorAll(".custom-date-popup.aktif").forEach((el) => {
            el.classList.remove("aktif");
        });
        popup.classList.add("aktif");
    }

    function popupKapat() {
        popup.classList.remove("aktif");
    }

    function metniGuncelle() {
        const seciliOption = hiddenSelect.options[hiddenSelect.selectedIndex];

        if (!hiddenSelect.value) {
            text.textContent = "ALAN SEÇİN";
            text.classList.add("placeholder");
            return;
        }

        text.textContent = seciliOption.textContent;
        text.classList.remove("placeholder");
    }

    trigger.addEventListener("click", () => {
        if (popup.classList.contains("aktif")) {
            popupKapat();
        } else {
            popupAc();
        }
    });

    options.forEach((optionBtn) => {
        optionBtn.addEventListener("click", () => {
            const value = optionBtn.dataset.value;
            hiddenSelect.value = value;
            hiddenSelect.dispatchEvent(new Event("change"));
            metniGuncelle();
            popupKapat();
        });
    });

    document.addEventListener("click", (event) => {
        if (!popup.contains(event.target) && !trigger.contains(event.target)) {
            popupKapat();
        }
    });

    metniGuncelle();
}

tytKaydetBtn.addEventListener("click", async () => {
    const denemeAdi = document.getElementById("tytDenemeAdi").value.trim();
    const tarih = document.getElementById("tytTarih").value;

    if (!denemeAdi || !tarih) {
        alert("Lütfen deneme adı ve tarih gir.");
        return;
    }

    const tytHata = tytSonucKontrolu();
    if (tytHata) {
        alert(tytHata);
        return;
    }

    const sonuclar = bosOlmayanSonuclariGetir([
        sonucNesnesiOlustur(DERS_IDLERI.tytTurkce, inputDegeriAl("tytTurkceDogru"), inputDegeriAl("tytTurkceYanlis")),
        sonucNesnesiOlustur(DERS_IDLERI.tytMatematik, inputDegeriAl("tytMatDogru"), inputDegeriAl("tytMatYanlis")),
        sonucNesnesiOlustur(DERS_IDLERI.tytTarih, inputDegeriAl("tytTarihDogru"), inputDegeriAl("tytTarihYanlis")),
        sonucNesnesiOlustur(DERS_IDLERI.tytCografya, inputDegeriAl("tytCografyaDogru"), inputDegeriAl("tytCografyaYanlis")),
        sonucNesnesiOlustur(DERS_IDLERI.tytFelsefe, inputDegeriAl("tytFelsefeDogru"), inputDegeriAl("tytFelsefeYanlis")),
        sonucNesnesiOlustur(DERS_IDLERI.tytDin, inputDegeriAl("tytDinDogru"), inputDegeriAl("tytDinYanlis")),
        sonucNesnesiOlustur(DERS_IDLERI.tytFizik, inputDegeriAl("tytFizikDogru"), inputDegeriAl("tytFizikYanlis")),
        sonucNesnesiOlustur(DERS_IDLERI.tytKimya, inputDegeriAl("tytKimyaDogru"), inputDegeriAl("tytKimyaYanlis")),
        sonucNesnesiOlustur(DERS_IDLERI.tytBiyoloji, inputDegeriAl("tytBiyolojiDogru"), inputDegeriAl("tytBiyolojiYanlis"))
    ]);

    if (sonuclar.length === 0) {
        alert("En az bir ders için doğru veya yanlış gir.");
        return;
    }

    const veri = {
        deneme_adi: denemeAdi,
        deneme_tarihi: tarih,
        deneme_turu: "TYT",
        sinav_kategorisi: "TYT",
        sonuclar
    };

    const basariliMi = await denemeKaydet(veri);

    if (basariliMi) {
        formuTemizle("TYT");
        await denemeleriGetir();
    }
});

aytKaydetBtn.addEventListener("click", async () => {
    const denemeAdi = document.getElementById("aytDenemeAdi").value.trim();
    const tarih = document.getElementById("aytTarih").value;
    const alanTuru = aytAlanSecimi.value;

    if (!denemeAdi || !tarih) {
        alert("Lütfen deneme adı ve tarih gir.");
        return;
    }

    if (!alanTuru) {
        alert("Lütfen AYT alanı seç.");
        return;
    }

    const aytHata = aytSonucKontrolu(alanTuru);
    if (aytHata) {
        alert(aytHata);
        return;
    }

    let sinavKategorisi = "";
    let sonuclar = [];

    if (alanTuru === "sayisal") {
        sinavKategorisi = "SAY";

        sonuclar = bosOlmayanSonuclariGetir([
            sonucNesnesiOlustur(DERS_IDLERI.aytMatematik, inputDegeriAl("sayisalMatDogru"), inputDegeriAl("sayisalMatYanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytFizik, inputDegeriAl("sayisalFizikDogru"), inputDegeriAl("sayisalFizikYanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytKimya, inputDegeriAl("sayisalKimyaDogru"), inputDegeriAl("sayisalKimyaYanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytBiyoloji, inputDegeriAl("sayisalBiyolojiDogru"), inputDegeriAl("sayisalBiyolojiYanlis"))
        ]);
    } else if (alanTuru === "esitAgirlik") {
        sinavKategorisi = "EA";

        sonuclar = bosOlmayanSonuclariGetir([
            sonucNesnesiOlustur(DERS_IDLERI.aytMatematik, inputDegeriAl("eaMatDogru"), inputDegeriAl("eaMatYanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytEdebiyat, inputDegeriAl("eaEdebiyatDogru"), inputDegeriAl("eaEdebiyatYanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytTarih1, inputDegeriAl("eaTarih1Dogru"), inputDegeriAl("eaTarih1Yanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytCografya1, inputDegeriAl("eaCografya1Dogru"), inputDegeriAl("eaCografya1Yanlis"))
        ]);
    } else if (alanTuru === "sozel") {
        sinavKategorisi = "SOZ";

        sonuclar = bosOlmayanSonuclariGetir([
            sonucNesnesiOlustur(DERS_IDLERI.aytEdebiyat, inputDegeriAl("sozelEdebiyatDogru"), inputDegeriAl("sozelEdebiyatYanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytTarih1, inputDegeriAl("sozelTarih1Dogru"), inputDegeriAl("sozelTarih1Yanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytCografya1, inputDegeriAl("sozelCografya1Dogru"), inputDegeriAl("sozelCografya1Yanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytTarih2, inputDegeriAl("sozelTarih2Dogru"), inputDegeriAl("sozelTarih2Yanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytCografya2, inputDegeriAl("sozelCografya2Dogru"), inputDegeriAl("sozelCografya2Yanlis")),
            sonucNesnesiOlustur(DERS_IDLERI.aytFelsefeGrubu, inputDegeriAl("sozelFelsefeDogru"), inputDegeriAl("sozelFelsefeYanlis"))
        ]);
    }

    if (sonuclar.length === 0) {
        alert("En az bir ders için doğru veya yanlış gir.");
        return;
    }

    const veri = {
        deneme_adi: denemeAdi,
        deneme_tarihi: tarih,
        deneme_turu: "AYT",
        sinav_kategorisi: sinavKategorisi,
        sonuclar
    };

    const basariliMi = await denemeKaydet(veri);

    if (basariliMi) {
        formuTemizle("AYT");
        await denemeleriGetir();
    }
});

const grafikCanvas = document.getElementById("netGrafik");

const netGrafik = new Chart(grafikCanvas, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "TYT",
                data: [],
                denemeAdlari: [],
                borderColor: "#4B3584",
                backgroundColor: "transparent",
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 5
            },
            {
                label: "AYT",
                data: [],
                denemeAdlari: [],
                borderColor: "#F0C470",
                backgroundColor: "transparent",
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 5
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: function (tooltipItems) {
                        const item = tooltipItems[0];
                        const dataset = item.dataset;
                        return dataset.denemeAdlari[item.dataIndex] || "";
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: "#a0a0c0"
                },
                grid: {
                    color: "rgba(255,255,255,0.05)"
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: "#a0a0c0"
                },
                grid: {
                    color: "rgba(255,255,255,0.05)"
                }
            }
        }
    }
});

function grafigiGuncelle() {
    const tytKayitlari = denemeKayitlari.filter((kayit) => kayit.deneme_turu === "TYT");
    const aytKayitlari = denemeKayitlari.filter((kayit) => kayit.deneme_turu === "AYT");

    const maxUzunluk = Math.max(tytKayitlari.length, aytKayitlari.length);
    const etiketler = [];

    for (let i = 0; i < maxUzunluk; i++) {
        etiketler.push((i + 1).toString());
    }

    netGrafik.data.labels = etiketler;
    netGrafik.data.datasets[0].data = tytKayitlari.map((kayit) => Number(kayit.toplam_net));
    netGrafik.data.datasets[0].denemeAdlari = tytKayitlari.map((kayit) => kayit.deneme_adi);

    netGrafik.data.datasets[1].data = aytKayitlari.map((kayit) => Number(kayit.toplam_net));
    netGrafik.data.datasets[1].denemeAdlari = aytKayitlari.map((kayit) => kayit.deneme_adi);

    netGrafik.update();
}

function sayfaBaslat() {
    if (!girisKontrolu()) return;

    sekmeGoster("tyt");
    aytAlanGoster();
    tumInputlaraDinleyiciEkle();
    enterIleSonrakiInputaGec();
    customDatePickerKurulum("tyt");
    customDatePickerKurulum("ayt");
    customSelectKurulum();
    denemeleriGetir();
}

denemeDetayKapatBtn.addEventListener("click", detayModalKapat);

denemeDetayModal.addEventListener("click", (event) => {
    if (event.target === denemeDetayModal) {
        detayModalKapat();
    }
});

sayfaBaslat();