let oturumSuresiDakika = 25;
let molaSuresiDakika = 5;
let turSayisi = 3;

let calisiyorMu = false;
let molaZamaniMi = false;
let zamanlayici = null;
let duraklatildiMi = false;
let kalanSureSaniye = oturumSuresiDakika * 60;

let oturumBaslangicZamani = null;
let gercekCalismaSuresiSaniye = 0;
let tamamlananTurSayisi = 0;

// Ders secimi
let secilenDersId = null;
let secilenDersAdi = "";

const dersSecButonu = document.getElementById("dersSecBtn");
const dersSecPaneli = document.getElementById("dersSecPanel");
const tytDersListesiAlani = document.getElementById("tytDersListesi");
const aytDersListesiAlani = document.getElementById("aytDersListesi");

// HTML elemanlari
const zamanGostergeAlani = document.getElementById("timerDisplay");
const baslatButonu = document.getElementById("startBtn");
const durdurButonu = document.getElementById("pauseBtn");
const sifirlaButonu = document.getElementById("resetBtn");

const toplamCalismaAlani = document.getElementById("toplamCalisma");
const enIyiCalismaAlani = document.getElementById("enIyiCalisma");

const molaAzaltButonu = document.getElementById("breakMinus");
const molaArttirButonu = document.getElementById("breakPlus");
const molaSureAlani = document.getElementById("breakLength");

const oturumAzaltButonu = document.getElementById("sessionMinus");
const oturumArttirButonu = document.getElementById("sessionPlus");
const oturumSureAlani = document.getElementById("sessionLength");

const turAzaltButonu = document.getElementById("roundMinus");
const turArttirButonu = document.getElementById("roundPlus");
const turSayisiAlani = document.getElementById("roundCount");

const modYazisiAlani = document.querySelector(".timer-mode");

function ayarlariKaydet() {
    localStorage.setItem("pomodoroOturumSuresi", oturumSuresiDakika);
    localStorage.setItem("pomodoroMolaSuresi", molaSuresiDakika);
    localStorage.setItem("pomodoroTurSayisi", turSayisi);
}

function ayarlariYukle() {
    const kayitliOturumSuresi = localStorage.getItem("pomodoroOturumSuresi");
    const kayitliMolaSuresi = localStorage.getItem("pomodoroMolaSuresi");
    const kayitliTurSayisi = localStorage.getItem("pomodoroTurSayisi");

    if (kayitliOturumSuresi !== null) {
        oturumSuresiDakika = Number(kayitliOturumSuresi);
    }

    if (kayitliMolaSuresi !== null) {
        molaSuresiDakika = Number(kayitliMolaSuresi);
    }

    if (kayitliTurSayisi !== null) {
        turSayisi = Number(kayitliTurSayisi);
    }

    kalanSureSaniye = oturumSuresiDakika * 60;
}

function zamaniFormatla(toplamSaniye) {
    const dakika = Math.floor(toplamSaniye / 60);
    const saniye = toplamSaniye % 60;

    const ikiHaneliDakika = String(dakika).padStart(2, "0");
    const ikiHaneliSaniye = String(saniye).padStart(2, "0");

    return `${ikiHaneliDakika}:${ikiHaneliSaniye}`;
}

function saniyeyiDakikayaCevir(toplamSaniye) {
    const dakika = Math.floor(toplamSaniye / 60);
    return `${dakika} dk`;
}

function ekraniGuncelle() {
    zamanGostergeAlani.textContent = zamaniFormatla(kalanSureSaniye);
    molaSureAlani.value = molaSuresiDakika;
    oturumSureAlani.value = oturumSuresiDakika;
    turSayisiAlani.value = turSayisi;

    if (molaZamaniMi) {
        modYazisiAlani.textContent = "MOLA";
    } else {
        modYazisiAlani.textContent = `${tamamlananTurSayisi + 1}. OTURUM`;
    }
}

function yerelTarihSaatFormatla(tarih) {
    const yil = tarih.getFullYear();
    const ay = String(tarih.getMonth() + 1).padStart(2, "0");
    const gun = String(tarih.getDate()).padStart(2, "0");
    const saat = String(tarih.getHours()).padStart(2, "0");
    const dakika = String(tarih.getMinutes()).padStart(2, "0");
    const saniye = String(tarih.getSeconds()).padStart(2, "0");

    return `${yil}-${ay}-${gun} ${saat}:${dakika}:${saniye}`;
}

function apiTarihFormatla(tarih) {
    const yil = tarih.getFullYear();
    const ay = String(tarih.getMonth() + 1).padStart(2, "0");
    const gun = String(tarih.getDate()).padStart(2, "0");
    return `${yil}-${ay}-${gun}`;
}

async function pomodoroKaydiniKaydet() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token bulunamadı.");
        return false;
    }

    if (!secilenDersId) {
        alert("Lütfen önce bir ders seç.");
        return false;
    }

    if (!oturumBaslangicZamani || gercekCalismaSuresiSaniye <= 0) {
        return false;
    }

    const simdi = new Date();
    const bugun = apiTarihFormatla(simdi);


    const veri = {
        ders_id: secilenDersId,
        baslangic_zamani: yerelTarihSaatFormatla(new Date(oturumBaslangicZamani)),
        bitis_zamani: yerelTarihSaatFormatla(simdi),
        calisma_suresi_saniye: gercekCalismaSuresiSaniye,
        mola_suresi_saniye: molaSuresiDakika * 60,
        tarih: bugun
    };
    try {
        const response = await fetch("http://localhost:3000/api/pomodoro/kaydet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(veri)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Pomodoro kaydı kaydedilemedi:", data.error || data.message);
            return false;
        }

        console.log("Pomodoro kaydı başarılı:", data);
        await pomodoroOzetiniGetir();
        return true;
    } catch (error) {
        console.error("Pomodoro kayıt hatası:", error);
        return false;
    }
}

async function pomodoroOzetiniGetir() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token bulunamadı.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/pomodoro/ozet", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Pomodoro özeti alınamadı:", data.error || data.message);
            return;
        }

        toplamCalismaAlani.textContent = saniyeyiDakikayaCevir(data.bugunkuToplamCalisma);
        enIyiCalismaAlani.textContent = saniyeyiDakikayaCevir(data.enIyiCalisma);
    } catch (error) {
        console.error("Pomodoro özet hatası:", error);
    }
}

molaAzaltButonu.addEventListener("click", () => {
    if (calisiyorMu) return;

    if (molaSuresiDakika > 1) {
        molaSuresiDakika--;
        tamamlananTurSayisi = 0;
        ayarlariKaydet();
        ekraniGuncelle();
    }
});

molaArttirButonu.addEventListener("click", () => {
    if (calisiyorMu) return;

    molaSuresiDakika++;
    tamamlananTurSayisi = 0;
    ayarlariKaydet();
    ekraniGuncelle();
});

oturumAzaltButonu.addEventListener("click", () => {
    if (calisiyorMu) return;

    if (oturumSuresiDakika > 1) {
        oturumSuresiDakika--;
        kalanSureSaniye = oturumSuresiDakika * 60;
        tamamlananTurSayisi = 0;
        ayarlariKaydet();
        ekraniGuncelle();
    }
});

oturumArttirButonu.addEventListener("click", () => {
    if (calisiyorMu) return;

    oturumSuresiDakika++;
    kalanSureSaniye = oturumSuresiDakika * 60;
    tamamlananTurSayisi = 0;
    ayarlariKaydet();
    ekraniGuncelle();
});

turAzaltButonu.addEventListener("click", () => {
    if (calisiyorMu) return;

    if (turSayisi > 1) {
        turSayisi--;
        tamamlananTurSayisi = 0;
        ayarlariKaydet();
        ekraniGuncelle();
    }
});

turArttirButonu.addEventListener("click", () => {
    if (calisiyorMu) return;

    turSayisi++;
    tamamlananTurSayisi = 0;
    ayarlariKaydet();
    ekraniGuncelle();
});

molaSureAlani.addEventListener("change", () => {
    if (calisiyorMu) return;

    let girilenDeger = Math.floor(Number(molaSureAlani.value));

    if (girilenDeger < 1 || isNaN(girilenDeger)) {
        girilenDeger = 1;
    }

    molaSuresiDakika = girilenDeger;
    tamamlananTurSayisi = 0;
    ayarlariKaydet();
    ekraniGuncelle();
});

oturumSureAlani.addEventListener("change", () => {
    if (calisiyorMu) return;

    let girilenDeger = Math.floor(Number(oturumSureAlani.value));

    if (girilenDeger < 1 || isNaN(girilenDeger)) {
        girilenDeger = 1;
    }

    oturumSuresiDakika = girilenDeger;
    kalanSureSaniye = oturumSuresiDakika * 60;
    tamamlananTurSayisi = 0;
    ayarlariKaydet();
    ekraniGuncelle();
});

turSayisiAlani.addEventListener("change", () => {
    if (calisiyorMu) return;

    let girilenDeger = Math.floor(Number(turSayisiAlani.value));

    if (girilenDeger < 1 || isNaN(girilenDeger)) {
        girilenDeger = 1;
    }

    turSayisi = girilenDeger;
    tamamlananTurSayisi = 0;
    ayarlariKaydet();
    ekraniGuncelle();
});

function zamanlayiciyiBaslat() {
    if (calisiyorMu) return;

    if (!secilenDersId) {
        alert("Lütfen önce bir ders seç.");
        return;
    }

    calisiyorMu = true;
    duraklatildiMi = false;
    durdurButonu.textContent = "Durdur";

    if (!molaZamaniMi && oturumBaslangicZamani === null) {
        oturumBaslangicZamani = new Date();
    }

    zamanlayici = setInterval(async () => {
        if (kalanSureSaniye > 0) {
            kalanSureSaniye--;

            if (!molaZamaniMi) {
                gercekCalismaSuresiSaniye++;
            }

            ekraniGuncelle();
        } else {
            clearInterval(zamanlayici);
            calisiyorMu = false;
            duraklatildiMi = false;
            durdurButonu.textContent = "Durdur";

            if (!molaZamaniMi) {
                const kayitBasariliMi = await pomodoroKaydiniKaydet();

                if (!kayitBasariliMi) {
                    return;
                }

                tamamlananTurSayisi++;

                if (tamamlananTurSayisi < turSayisi) {
                    molaZamaniMi = true;
                    kalanSureSaniye = molaSuresiDakika * 60;
                    gercekCalismaSuresiSaniye = 0;
                    oturumBaslangicZamani = null;
                    ekraniGuncelle();
                    zamanlayiciyiBaslat();
                } else {
                    oturumBaslangicZamani = null;
                    gercekCalismaSuresiSaniye = 0;
                    durdurButonu.textContent = "Durdur";
                    ekraniGuncelle();
                }
            } else {
                molaZamaniMi = false;
                kalanSureSaniye = oturumSuresiDakika * 60;
                oturumBaslangicZamani = null;
                gercekCalismaSuresiSaniye = 0;
                ekraniGuncelle();
                zamanlayiciyiBaslat();
            }
        }
    }, 1000);
}

function zamanlayiciyiDurdur() {
    if (calisiyorMu) {
        clearInterval(zamanlayici);
        calisiyorMu = false;
        duraklatildiMi = true;
        durdurButonu.textContent = "Devam Et";
    } else if (duraklatildiMi) {
        zamanlayiciyiBaslat();
    }
}

async function zamanlayiciyiSifirla() {
    clearInterval(zamanlayici);
    calisiyorMu = false;

    if (!molaZamaniMi && gercekCalismaSuresiSaniye > 0) {
        await pomodoroKaydiniKaydet();
    }

    molaZamaniMi = false;
    duraklatildiMi = false;
    durdurButonu.textContent = "Durdur";

    kalanSureSaniye = oturumSuresiDakika * 60;
    oturumBaslangicZamani = null;
    gercekCalismaSuresiSaniye = 0;
    tamamlananTurSayisi = 0;

    ekraniGuncelle();
}

dersSecButonu.addEventListener("click", () => {
    dersSecPaneli.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".ders-sec-dropdown")) {
        dersSecPaneli.classList.add("hidden");
    }
});

async function dersleriGetir(kategori) {
    try {
        const response = await fetch(`http://localhost:3000/api/konu/dersler/${kategori}`);
        const data = await response.json();

        if (!response.ok) {
            console.error(`${kategori} dersleri alınamadı.`);
            return [];
        }

        return data;
    } catch (error) {
        console.error(`${kategori} dersleri getirme hatası:`, error);
        return [];
    }
}

function dersleriListeyeBas(dersler, hedefAlan, kategori) {
    hedefAlan.innerHTML = "";

    dersler.forEach((ders) => {
        const satir = document.createElement("label");
        satir.className = "ders-secim-satiri";

        let gosterilecekDersAdi = ders.ders_adi;

        if (kategori === "TYT") {
            gosterilecekDersAdi = `${ders.ders_adi} (TYT)`;
        }

        satir.innerHTML = `
            <input type="radio" name="seciliDers" value="${ders.ders_id}">
            <span>${gosterilecekDersAdi}</span>
        `;

        const radio = satir.querySelector("input");

        radio.addEventListener("change", () => {
            secilenDersId = Number(ders.ders_id);
            secilenDersAdi = gosterilecekDersAdi;
            dersSecButonu.textContent = gosterilecekDersAdi;
            dersSecPaneli.classList.add("hidden");
        });

        hedefAlan.appendChild(satir);
    });
}

async function dersListeleriniYukle() {
    const tytDersleri = await dersleriGetir("TYT");
    const aytDersleri = await dersleriGetir("AYT");

    dersleriListeyeBas(tytDersleri, tytDersListesiAlani, "TYT");
    dersleriListeyeBas(aytDersleri, aytDersListesiAlani, "AYT");
}

window.addEventListener("beforeunload", (e) => {
    if ((calisiyorMu || duraklatildiMi) && !molaZamaniMi && gercekCalismaSuresiSaniye > 0) {
        e.preventDefault();
        e.returnValue = "";
    }
});

baslatButonu.addEventListener("click", zamanlayiciyiBaslat);
durdurButonu.addEventListener("click", zamanlayiciyiDurdur);
sifirlaButonu.addEventListener("click", zamanlayiciyiSifirla);

ayarlariYukle();
ekraniGuncelle();
pomodoroOzetiniGetir();
dersListeleriniYukle();