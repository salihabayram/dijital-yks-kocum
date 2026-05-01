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

const DERS_GRUPLARI = {
    tyt: [
        { ad: "Türkçe", ders_id: DERS_IDLERI.tytTurkce, dogru: "tytTurkceDogru", yanlis: "tytTurkceYanlis", bos: "tytTurkceBos", net: "tytTurkceNet", soru: 40 },
        { ad: "Temel Matematik", ders_id: DERS_IDLERI.tytMatematik, dogru: "tytMatDogru", yanlis: "tytMatYanlis", bos: "tytMatBos", net: "tytMatNet", soru: 40 },
        { ad: "Tarih", ders_id: DERS_IDLERI.tytTarih, dogru: "tytTarihDogru", yanlis: "tytTarihYanlis", bos: "tytTarihBos", net: "tytTarihNet", soru: 5 },
        { ad: "Coğrafya", ders_id: DERS_IDLERI.tytCografya, dogru: "tytCografyaDogru", yanlis: "tytCografyaYanlis", bos: "tytCografyaBos", net: "tytCografyaNet", soru: 5 },
        { ad: "Felsefe", ders_id: DERS_IDLERI.tytFelsefe, dogru: "tytFelsefeDogru", yanlis: "tytFelsefeYanlis", bos: "tytFelsefeBos", net: "tytFelsefeNet", soru: 5 },
        { ad: "Din Kültürü", ders_id: DERS_IDLERI.tytDin, dogru: "tytDinDogru", yanlis: "tytDinYanlis", bos: "tytDinBos", net: "tytDinNet", soru: 5 },
        { ad: "Fizik", ders_id: DERS_IDLERI.tytFizik, dogru: "tytFizikDogru", yanlis: "tytFizikYanlis", bos: "tytFizikBos", net: "tytFizikNet", soru: 7 },
        { ad: "Kimya", ders_id: DERS_IDLERI.tytKimya, dogru: "tytKimyaDogru", yanlis: "tytKimyaYanlis", bos: "tytKimyaBos", net: "tytKimyaNet", soru: 7 },
        { ad: "Biyoloji", ders_id: DERS_IDLERI.tytBiyoloji, dogru: "tytBiyolojiDogru", yanlis: "tytBiyolojiYanlis", bos: "tytBiyolojiBos", net: "tytBiyolojiNet", soru: 6 }
    ],
    sayisal: [
        { ad: "Matematik", ders_id: DERS_IDLERI.aytMatematik, dogru: "sayisalMatDogru", yanlis: "sayisalMatYanlis", bos: "sayisalMatBos", net: "sayisalMatNet", soru: 40 },
        { ad: "Fizik", ders_id: DERS_IDLERI.aytFizik, dogru: "sayisalFizikDogru", yanlis: "sayisalFizikYanlis", bos: "sayisalFizikBos", net: "sayisalFizikNet", soru: 14 },
        { ad: "Kimya", ders_id: DERS_IDLERI.aytKimya, dogru: "sayisalKimyaDogru", yanlis: "sayisalKimyaYanlis", bos: "sayisalKimyaBos", net: "sayisalKimyaNet", soru: 13 },
        { ad: "Biyoloji", ders_id: DERS_IDLERI.aytBiyoloji, dogru: "sayisalBiyolojiDogru", yanlis: "sayisalBiyolojiYanlis", bos: "sayisalBiyolojiBos", net: "sayisalBiyolojiNet", soru: 13 }
    ],
    esitAgirlik: [
        { ad: "Matematik", ders_id: DERS_IDLERI.aytMatematik, dogru: "eaMatDogru", yanlis: "eaMatYanlis", bos: "eaMatBos", net: "eaMatNet", soru: 40 },
        { ad: "Edebiyat", ders_id: DERS_IDLERI.aytEdebiyat, dogru: "eaEdebiyatDogru", yanlis: "eaEdebiyatYanlis", bos: "eaEdebiyatBos", net: "eaEdebiyatNet", soru: 24 },
        { ad: "Tarih-1", ders_id: DERS_IDLERI.aytTarih1, dogru: "eaTarih1Dogru", yanlis: "eaTarih1Yanlis", bos: "eaTarih1Bos", net: "eaTarih1Net", soru: 10 },
        { ad: "Coğrafya-1", ders_id: DERS_IDLERI.aytCografya1, dogru: "eaCografya1Dogru", yanlis: "eaCografya1Yanlis", bos: "eaCografya1Bos", net: "eaCografya1Net", soru: 6 }
    ],
    sozel: [
        { ad: "Edebiyat", ders_id: DERS_IDLERI.aytEdebiyat, dogru: "sozelEdebiyatDogru", yanlis: "sozelEdebiyatYanlis", bos: "sozelEdebiyatBos", net: "sozelEdebiyatNet", soru: 24 },
        { ad: "Tarih-1", ders_id: DERS_IDLERI.aytTarih1, dogru: "sozelTarih1Dogru", yanlis: "sozelTarih1Yanlis", bos: "sozelTarih1Bos", net: "sozelTarih1Net", soru: 10 },
        { ad: "Coğrafya-1", ders_id: DERS_IDLERI.aytCografya1, dogru: "sozelCografya1Dogru", yanlis: "sozelCografya1Yanlis", bos: "sozelCografya1Bos", net: "sozelCografya1Net", soru: 6 },
        { ad: "Tarih-2", ders_id: DERS_IDLERI.aytTarih2, dogru: "sozelTarih2Dogru", yanlis: "sozelTarih2Yanlis", bos: "sozelTarih2Bos", net: "sozelTarih2Net", soru: 11 },
        { ad: "Coğrafya-2", ders_id: DERS_IDLERI.aytCografya2, dogru: "sozelCografya2Dogru", yanlis: "sozelCografya2Yanlis", bos: "sozelCografya2Bos", net: "sozelCografya2Net", soru: 11 },
        { ad: "Felsefe Grubu", ders_id: DERS_IDLERI.aytFelsefeGrubu, dogru: "sozelFelsefeDogru", yanlis: "sozelFelsefeYanlis", bos: "sozelFelsefeBos", net: "sozelFelsefeNet", soru: 12 }
    ]
};

let denemeKayitlari = [];

function tokenAl() { return localStorage.getItem("token"); }
function girisKontrolu() {
    if (!tokenAl()) {
        alert("Lütfen önce giriş yap.");
        window.location.href = "index.html";
        return false;
    }
    return true;
}
function authHeaders(jsonIcerik = false) {
    const headers = { "Authorization": `Bearer ${tokenAl()}` };
    if (jsonIcerik) headers["Content-Type"] = "application/json";
    return headers;
}
function inputDegeriAl(id) {
    const el = document.getElementById(id);
    const deger = Number(el?.value ?? 0);
    return Number.isFinite(deger) ? deger : 0;
}
function netHesapla(dogru, yanlis) { return dogru - yanlis / 4; }
function sayiYuvarla(sayi) { return Number(sayi.toFixed(2)); }
function tarihFormatla(tarihDegeri) {
    if (!tarihDegeri) return "-";
    const yalnizTarih = String(tarihDegeri).split("T")[0];
    const parcalar = yalnizTarih.split("-");
    return parcalar.length === 3 ? `${parcalar[2]}.${parcalar[1]}.${parcalar[0]}` : tarihDegeri;
}
function tarihiGosterimFormatinaCevir(isoTarih) {
    if (!isoTarih) return "gg.aa.yyyy";
    const [yil, ay, gun] = isoTarih.split("-");
    return `${gun}.${ay}.${yil}`;
}
function bugununIsoTarihi() {
    const bugun = new Date();
    return `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, "0")}-${String(bugun.getDate()).padStart(2, "0")}`;
}

function sonucNesnesiOlustur(ders) {
    const dogru = inputDegeriAl(ders.dogru);
    const yanlis = inputDegeriAl(ders.yanlis);
    const bos = inputDegeriAl(ders.bos);
    return {
        ders_id: ders.ders_id,
        dogru_sayisi: dogru,
        yanlis_sayisi: yanlis,
        bos_sayisi: bos,
        net_sayisi: sayiYuvarla(netHesapla(dogru, yanlis))
    };
}
function bosOlmayanSonuclariGetir(sonuclar) {
    return sonuclar.filter(s => s.dogru_sayisi > 0 || s.yanlis_sayisi > 0 || s.bos_sayisi > 0);
}
function dersKontroluYap(ders) {
    const dogru = inputDegeriAl(ders.dogru);
    const yanlis = inputDegeriAl(ders.yanlis);
    const bos = inputDegeriAl(ders.bos);
    if (dogru < 0 || yanlis < 0 || bos < 0) return `${ders.ad} için doğru, yanlış ve boş negatif olamaz.`;
    if (dogru + yanlis + bos > ders.soru) return `${ders.ad} için doğru + yanlış + boş toplamı ${ders.soru} soruyu geçemez.`;
    return null;
}
function grupKontroluYap(grup) {
    return grup.map(dersKontroluYap).find(hata => hata !== null) || null;
}
function dersNetleriniYaz(grup) {
    let toplam = 0;
    grup.forEach(ders => {
        const net = sayiYuvarla(netHesapla(inputDegeriAl(ders.dogru), inputDegeriAl(ders.yanlis)));
        toplam += net;
        const netEl = document.getElementById(ders.net);
        if (netEl) netEl.textContent = net.toFixed(2);
    });
    return sayiYuvarla(toplam);
}
function tytNetHesapla() {
    const toplam = dersNetleriniYaz(DERS_GRUPLARI.tyt);
    tytToplamNetAlani.textContent = toplam.toFixed(2);
    return toplam;
}
function aytNetHesapla() {
    const alan = aytAlanSecimi.value;
    const grup = DERS_GRUPLARI[alan] || [];
    const toplam = dersNetleriniYaz(grup);
    aytToplamNetAlani.textContent = toplam.toFixed(2);
    return toplam;
}
function tumInputlaraDinleyiciEkle() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener("input", () => { tytNetHesapla(); aytNetHesapla(); });
    });
}
function inputGorunurMu(eleman) { return eleman && eleman.offsetParent !== null && !eleman.disabled && !eleman.readOnly; }
function enterIleSonrakiInputaGec() {
    const tumSayiInputlari = Array.from(document.querySelectorAll('input[type="number"]'));
    tumSayiInputlari.forEach((input, index) => {
        input.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            for (let i = index + 1; i < tumSayiInputlari.length; i++) {
                if (inputGorunurMu(tumSayiInputlari[i])) {
                    tumSayiInputlari[i].focus();
                    tumSayiInputlari[i].select();
                    return;
                }
            }
        });
    });
}
function alanInputlariniTemizle(selector) {
    document.querySelectorAll(`${selector} input[type='number']`).forEach(input => input.value = "");
}
function formuTemizle(formTuru) {
    if (formTuru === "TYT") {
        document.getElementById("tytDenemeAdi").value = "";
        document.getElementById("tytTarih").value = "";
        document.getElementById("tytTarihText").textContent = "gg.aa.yyyy";
        document.getElementById("tytTarihText").classList.add("placeholder");
        alanInputlariniTemizle("#tytTabContent");
        tytNetHesapla();
    } else {
        document.getElementById("aytDenemeAdi").value = "";
        document.getElementById("aytTarih").value = "";
        document.getElementById("aytTarihText").textContent = "gg.aa.yyyy";
        document.getElementById("aytTarihText").classList.add("placeholder");
        aytAlanSecimi.value = "";
        document.getElementById("aytAlanText").textContent = "ALAN SEÇİN";
        document.getElementById("aytAlanText").classList.add("placeholder");
        alanInputlariniTemizle("#aytTabContent");
        aytAlanGoster();
        aytNetHesapla();
    }
}
function sekmeGoster(sekme) {
    if (sekme === "tyt") {
        tytTabBtn.classList.add("aktif"); aytTabBtn.classList.remove("aktif");
        tytTabContent.classList.add("aktif"); aytTabContent.classList.remove("aktif");
    } else {
        aytTabBtn.classList.add("aktif"); tytTabBtn.classList.remove("aktif");
        aytTabContent.classList.add("aktif"); tytTabContent.classList.remove("aktif");
    }
}
function aytAlanlariniGizle() {
    sayisalAlan.classList.remove("aktif-alan");
    esitAgirlikAlan.classList.remove("aktif-alan");
    sozelAlan.classList.remove("aktif-alan");
}
function aytAlanGoster() {
    aytAlanlariniGizle();
    const secilenAlan = aytAlanSecimi.value;
    if (secilenAlan === "sayisal") sayisalAlan.classList.add("aktif-alan");
    if (secilenAlan === "esitAgirlik") esitAgirlikAlan.classList.add("aktif-alan");
    if (secilenAlan === "sozel") sozelAlan.classList.add("aktif-alan");
    aytNetHesapla();
}

tytTabBtn.addEventListener("click", () => sekmeGoster("tyt"));
aytTabBtn.addEventListener("click", () => sekmeGoster("ayt"));
aytAlanSecimi.addEventListener("change", aytAlanGoster);

function detayModalAc() { denemeDetayModal.classList.remove("hidden"); }
function detayModalKapat() { denemeDetayModal.classList.add("hidden"); }
function denemeDetayiniRenderEt(data) {
    const { deneme, dersler, toplam_net } = data;
    denemeDetayBaslik.textContent = deneme.deneme_adi;
    denemeDetayMeta.textContent = `${tarihFormatla(deneme.deneme_tarihi)} • ${deneme.deneme_turu} • ${deneme.sinav_kategorisi}`;
    denemeDetayOzet.innerHTML = `
        <div class="detay-ozet-karti"><div class="detay-ozet-baslik">Toplam Net</div><div class="detay-ozet-deger">${Number(toplam_net).toFixed(2)}</div></div>
        <div class="detay-ozet-karti"><div class="detay-ozet-baslik">Tür</div><div class="detay-ozet-deger">${deneme.deneme_turu}</div></div>
        <div class="detay-ozet-karti"><div class="detay-ozet-baslik">Kategori</div><div class="detay-ozet-deger">${deneme.sinav_kategorisi}</div></div>
        <div class="detay-ozet-karti"><div class="detay-ozet-baslik">Ders Sayısı</div><div class="detay-ozet-deger">${dersler.length}</div></div>`;
    denemeDetayBody.innerHTML = "";
    dersler.forEach(ders => {
        const satir = document.createElement("tr");
        satir.innerHTML = `<td>${ders.ders_adi}</td><td>${ders.dogru_sayisi}</td><td>${ders.yanlis_sayisi}</td><td>${ders.bos_sayisi ?? 0}</td><td>${Number(ders.net_sayisi).toFixed(2)}</td>`;
        denemeDetayBody.appendChild(satir);
    });
}
async function denemeDetayiniGetir(denemeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${denemeId}`, { headers: authHeaders() });
        const data = await response.json();
        if (!response.ok) { alert(data.error || "Deneme detayı alınamadı."); return; }
        denemeDetayiniRenderEt(data);
        detayModalAc();
    } catch (error) {
        console.error("Deneme detayı alma hatası:", error);
        alert("Sunucuya ulaşılamadı.");
    }
}
function tabloyuRenderEt() {
    denemeGecmisiBody.innerHTML = "";

    denemeKayitlari.forEach(kayit => {
        const satir = document.createElement("tr");

        satir.innerHTML = `
            <td>${tarihFormatla(kayit.tarih)}</td>
            <td>${kayit.deneme_adi}</td>
            <td>${kayit.deneme_turu}</td>
            <td>${Number(kayit.toplam_net).toFixed(2)}</td>
            <td>
                <div class="islem-btn-grup">
                    <button type="button" class="incele-btn" data-id="${kayit.deneme_id}">İncele</button>
                    <button type="button" class="sil-btn" data-id="${kayit.deneme_id}">🗑️</button>
                </div>
            </td>
        `;

        denemeGecmisiBody.appendChild(satir);
    });
}

denemeGecmisiBody.addEventListener("click", async (event) => {
    const inceleBtn = event.target.closest(".incele-btn");
    const silBtn = event.target.closest(".sil-btn");

    if (inceleBtn) {
        const denemeId = Number(inceleBtn.dataset.id);
        await denemeDetayiniGetir(denemeId);
        return;
    }

    if (silBtn) {
        const denemeId = Number(silBtn.dataset.id);

        if (!confirm("Bu denemeyi silmek istediğine emin misin?")) {
            return;
        }

        await denemeSil(denemeId);
    }
});

async function denemeleriGetir() {
    try {
        const response = await fetch(`${API_BASE_URL}/liste`, { headers: authHeaders() });
        const data = await response.json();
        if (!response.ok) { console.error("Denemeler alınamadı:", data.error || data.message); return; }
        denemeKayitlari = data;
        tabloyuRenderEt();
        grafigiGuncelle();
    } catch (error) { console.error("Deneme listeleme hatası:", error); }
}
async function denemeKaydet(veri) {
    try {
        const response = await fetch(`${API_BASE_URL}/kaydet`, { method: "POST", headers: authHeaders(true), body: JSON.stringify(veri) });
        const data = await response.json();
        if (!response.ok) { alert(data.error || "Deneme kaydedilemedi."); return false; }
        return true;
    } catch (error) { console.error("Deneme kayıt hatası:", error); alert("Sunucuya ulaşılamadı."); return false; }
}
async function denemeSil(denemeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${denemeId}`, { method: "DELETE", headers: authHeaders() });
        const data = await response.json();
        if (!response.ok) { alert(data.error || "Deneme silinemedi."); return; }
        await denemeleriGetir();
    } catch (error) { console.error("Deneme silme hatası:", error); alert("Silme işlemi sırasında sunucuya ulaşılamadı."); }
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
    const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    let gorunenAy, gorunenYil;
    function seciliTarihiAyarla(isoTarih) {
        hiddenInput.value = isoTarih;
        text.textContent = isoTarih ? tarihiGosterimFormatinaCevir(isoTarih) : "gg.aa.yyyy";
        text.classList.toggle("placeholder", !isoTarih);
    }
    function popupAc() {
        document.querySelectorAll(".custom-date-popup.aktif").forEach(el => { if (el !== popup) el.classList.remove("aktif"); });
        document.querySelectorAll(".custom-select-popup.aktif").forEach(el => el.classList.remove("aktif"));
        const kaynakTarih = hiddenInput.value ? new Date(hiddenInput.value) : new Date();
        gorunenAy = kaynakTarih.getMonth();
        gorunenYil = kaynakTarih.getFullYear();
        takvimiRenderEt();
        popup.classList.add("aktif");
    }
    function takvimiRenderEt() {
        title.textContent = `${aylar[gorunenAy]} ${gorunenYil}`;
        grid.innerHTML = "";
        const ilkGun = new Date(gorunenYil, gorunenAy, 1);
        let haftaninGunu = ilkGun.getDay();
        haftaninGunu = haftaninGunu === 0 ? 6 : haftaninGunu - 1;
        const ayinGunSayisi = new Date(gorunenYil, gorunenAy + 1, 0).getDate();
        const oncekiAyinGunSayisi = new Date(gorunenYil, gorunenAy, 0).getDate();
        const secili = hiddenInput.value || "";
        const bugunIso = bugununIsoTarihi();
        for (let i = haftaninGunu - 1; i >= 0; i--) {
            const btn = document.createElement("button");
            btn.type = "button"; btn.className = "date-day-btn pasif"; btn.textContent = oncekiAyinGunSayisi - i; grid.appendChild(btn);
        }
        for (let gun = 1; gun <= ayinGunSayisi; gun++) {
            const isoTarih = `${gorunenYil}-${String(gorunenAy + 1).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;
            const btn = document.createElement("button");
            btn.type = "button"; btn.className = "date-day-btn"; btn.textContent = gun;
            if (isoTarih === bugunIso) btn.classList.add("bugun");
            if (isoTarih === secili) btn.classList.add("secili");
            btn.addEventListener("click", () => { seciliTarihiAyarla(isoTarih); popup.classList.remove("aktif"); });
            grid.appendChild(btn);
        }
        const toplamHucre = haftaninGunu + ayinGunSayisi;
        const kalanHucre = toplamHucre % 7 === 0 ? 0 : 7 - (toplamHucre % 7);
        for (let gun = 1; gun <= kalanHucre; gun++) {
            const btn = document.createElement("button");
            btn.type = "button"; btn.className = "date-day-btn pasif"; btn.textContent = gun; grid.appendChild(btn);
        }
    }
    trigger.addEventListener("click", () => popup.classList.contains("aktif") ? popup.classList.remove("aktif") : popupAc());
    prevBtn.addEventListener("click", () => { gorunenAy--; if (gorunenAy < 0) { gorunenAy = 11; gorunenYil--; } takvimiRenderEt(); });
    nextBtn.addEventListener("click", () => { gorunenAy++; if (gorunenAy > 11) { gorunenAy = 0; gorunenYil++; } takvimiRenderEt(); });
    todayBtn.addEventListener("click", () => { seciliTarihiAyarla(bugununIsoTarihi()); popup.classList.remove("aktif"); });
    clearBtn.addEventListener("click", () => { seciliTarihiAyarla(""); popup.classList.remove("aktif"); });
    document.addEventListener("click", event => { if (!popup.contains(event.target) && !trigger.contains(event.target)) popup.classList.remove("aktif"); });
    seciliTarihiAyarla("");
}
function customSelectKurulum() {
    const hiddenSelect = document.getElementById("aytAlanSecimi");
    const trigger = document.getElementById("aytAlanTrigger");
    const text = document.getElementById("aytAlanText");
    const popup = document.getElementById("aytAlanPopup");
    popup.querySelectorAll(".custom-select-option").forEach(option => {
        option.addEventListener("click", () => {
            hiddenSelect.value = option.dataset.value;
            text.textContent = option.textContent.trim();
            text.classList.remove("placeholder");
            popup.classList.remove("aktif");
            aytAlanGoster();
        });
    });
    trigger.addEventListener("click", () => popup.classList.toggle("aktif"));
    document.addEventListener("click", event => { if (!popup.contains(event.target) && !trigger.contains(event.target)) popup.classList.remove("aktif"); });
}

tytKaydetBtn.addEventListener("click", async () => {
    const denemeAdi = document.getElementById("tytDenemeAdi").value.trim();
    const tarih = document.getElementById("tytTarih").value;
    if (!denemeAdi || !tarih) { alert("Lütfen deneme adı ve tarih gir."); return; }
    const hata = grupKontroluYap(DERS_GRUPLARI.tyt);
    if (hata) { alert(hata); return; }
    const sonuclar = bosOlmayanSonuclariGetir(DERS_GRUPLARI.tyt.map(sonucNesnesiOlustur));
    if (sonuclar.length === 0) { alert("En az bir ders için doğru, yanlış veya boş gir."); return; }
    const basariliMi = await denemeKaydet({ deneme_adi: denemeAdi, deneme_tarihi: tarih, deneme_turu: "TYT", sinav_kategorisi: "TYT", sonuclar });
    if (basariliMi) { formuTemizle("TYT"); await denemeleriGetir(); }
});

aytKaydetBtn.addEventListener("click", async () => {
    const denemeAdi = document.getElementById("aytDenemeAdi").value.trim();
    const tarih = document.getElementById("aytTarih").value;
    const alanTuru = aytAlanSecimi.value;
    if (!denemeAdi || !tarih) { alert("Lütfen deneme adı ve tarih gir."); return; }
    if (!alanTuru) { alert("Lütfen AYT alanı seç."); return; }
    const hata = grupKontroluYap(DERS_GRUPLARI[alanTuru]);
    if (hata) { alert(hata); return; }
    const kategoriMap = { sayisal: "SAY", esitAgirlik: "EA", sozel: "SOZ" };
    const sonuclar = bosOlmayanSonuclariGetir(DERS_GRUPLARI[alanTuru].map(sonucNesnesiOlustur));
    if (sonuclar.length === 0) { alert("En az bir ders için doğru, yanlış veya boş gir."); return; }
    const basariliMi = await denemeKaydet({ deneme_adi: denemeAdi, deneme_tarihi: tarih, deneme_turu: "AYT", sinav_kategorisi: kategoriMap[alanTuru], sonuclar });
    if (basariliMi) { formuTemizle("AYT"); await denemeleriGetir(); }
});

let netGrafik = null;

function grafigiOlustur() {
    const grafikCanvas = document.getElementById("denemeGrafik");

    if (!grafikCanvas) {
        console.error("denemeGrafik id'li canvas bulunamadı.");
        return;
    }

    netGrafik = new Chart(grafikCanvas, {
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
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function (items) {
                            return items[0].dataset.denemeAdlari[items[0].dataIndex] || "";
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#a0a0c0" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#a0a0c0" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            }
        }
    });
}

function grafigiGuncelle() {
    if (!netGrafik) return;

    const tytKayitlari = denemeKayitlari
        .filter(k => k.deneme_turu === "TYT")
        .slice()
        .reverse();

    const aytKayitlari = denemeKayitlari
        .filter(k => k.deneme_turu === "AYT")
        .slice()
        .reverse();

    const maxUzunluk = Math.max(tytKayitlari.length, aytKayitlari.length);

    netGrafik.data.labels = Array.from({ length: maxUzunluk }, (_, i) => (i + 1).toString());

    netGrafik.data.datasets[0].data = tytKayitlari.map(k => Number(k.toplam_net));
    netGrafik.data.datasets[0].denemeAdlari = tytKayitlari.map(k => k.deneme_adi);

    netGrafik.data.datasets[1].data = aytKayitlari.map(k => Number(k.toplam_net));
    netGrafik.data.datasets[1].denemeAdlari = aytKayitlari.map(k => k.deneme_adi);

    netGrafik.update();
}

denemeDetayKapatBtn.addEventListener("click", detayModalKapat);
denemeDetayModal.addEventListener("click", event => { if (event.target === denemeDetayModal) detayModalKapat(); });

document.addEventListener("DOMContentLoaded", async () => {
    if (!girisKontrolu()) return;
    customDatePickerKurulum("tyt");
    customDatePickerKurulum("ayt");
    customSelectKurulum();
    grafigiOlustur();
    tumInputlaraDinleyiciEkle();
    enterIleSonrakiInputaGec();
    tytNetHesapla();
    aytNetHesapla();
    await denemeleriGetir();
    w
});
