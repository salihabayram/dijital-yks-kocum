const CONFIG = {
    API_BASE: "/api",
    TOKEN: localStorage.getItem("token"),
    COLORS: {
        "Türkçe": "#FF8A5B",
        "Matematik": "#3B82F6",
        "Geometri": "#60A5FA",
        "Fizik": "#F59E0B",
        "Kimya": "#10B981",
        "Biyoloji": "#8B5CF6",
        "Edebiyat": "#EC4899",
        "Tarih": "#8B4513",
        "Coğrafya": "#064E3B",
        "Matematik (AYT)": "#1E3A8A",
        "Geometri (AYT)": "#2563EB",
        "Fizik (AYT)": "#D97706",
        "Kimya (AYT)": "#059669",
        "Biyoloji (AYT)": "#7C3AED",
        "Edebiyat (AYT)": "#DB2777",
        "Default": "#6366F1"
    }
};

let aktifTarih = new Date();
let grafikReferansTarih = new Date();

const headers = {
    "Authorization": `Bearer ${CONFIG.TOKEN}`,
    "Content-Type": "application/json"
};

function apiTarihFormatla(tarih) {
    const yil = tarih.getFullYear();
    const ay = String(tarih.getMonth() + 1).padStart(2, "0");
    const gun = String(tarih.getDate()).padStart(2, "0");
    return `${yil}-${ay}-${gun}`;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!CONFIG.TOKEN) {
        window.location.href = "/";
        return;
    }

    document.querySelector(".add-task-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        const modal = document.getElementById("taskModal");
        if (modal) modal.style.display = "flex";
    });

    document.getElementById("closeModal")?.addEventListener("click", () => {
        const modal = document.getElementById("taskModal");
        if (modal) modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        const modal = document.getElementById("taskModal");
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    document.getElementById("saveTaskBtn")?.addEventListener("click", addNewTask);

    document.getElementById("prevDay")?.addEventListener("click", () => {
        aktifTarih.setDate(aktifTarih.getDate() - 1);
        sayfayiGuncelle(aktifTarih);
    });

    document.getElementById("nextDay")?.addEventListener("click", () => {
        aktifTarih.setDate(aktifTarih.getDate() + 1);
        sayfayiGuncelle(aktifTarih);
    });

    updateTimer();
    setInterval(updateTimer, 1000);

    sayfayiGuncelle(aktifTarih);
    fetchDashboardData();
    fetchWeeklyStudy(grafikReferansTarih);
    fetchDenemeNetleri();
});

async function addNewTask() {
    const input = document.getElementById("taskInput");
    const baslik = input?.value.trim();

    if (!baslik) {
        showToast("Lütfen bir görev girin.", "error");
        return;
    }

    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const secilen = new Date(aktifTarih);
    secilen.setHours(0, 0, 0, 0);

    if (secilen < bugun) {
        showToast("Geçmiş bir tarihe görev ekleyemezsiniz!", "error");
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE}/gorev/ekle`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                baslik: baslik,
                hedef_tarih: apiTarihFormatla(aktifTarih)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.error || "Görev eklenirken hata oluştu.", "error");
            return;
        }

        input.value = "";

        const modal = document.getElementById("taskModal");
        if (modal) modal.style.display = "none";

        await fetchGorevlerByTarih(aktifTarih);
        showToast("Görev başarıyla eklendi!", "success");
    } catch (err) {
        console.error("Görev ekleme hatası:", err);
        showToast("Sunucuya bağlanılamadı.", "error");
    }
}

window.updateTaskStatus = async function (gorevId, yapildi) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/gorev/guncelle`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                gorevId,
                yapildi: yapildi ? 1 : 0
            })
        });

        if (!response.ok) {
            const data = await response.json();
            showToast(data.error || "Görev güncellenemedi.", "error");
            return;
        }

        await fetchGorevlerByTarih(aktifTarih);
    } catch (err) {
        console.error("Görev güncelleme hatası:", err);
        showToast("Bağlantı hatası oluştu.", "error");
    }
};

window.deleteTask = async function (gorevId) {
    showConfirmToast("Bu görevi silmek istediğinize emin misiniz?", async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE}/gorev/sil`, {
                method: "POST",
                headers,
                body: JSON.stringify({ gorevId })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.error || "Silme işlemi başarısız.", "error");
                return;
            }

            await fetchGorevlerByTarih(aktifTarih);
            showToast("Görev başarıyla silindi.", "success");
        } catch (err) {
            console.error("Silme hatası:", err);
            showToast("Bağlantı hatası oluştu.", "error");
        }
    });
};

async function fetchDashboardData() {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/gorev/stats`, { headers });

        if (!response.ok) {
            throw new Error("Stats verisi alınamadı.");
        }

        const data = await response.json();

        const welcomeEl = document.getElementById("welcome-user");
        if (welcomeEl) {
            welcomeEl.innerText = `Hoş geldin, ${data.ogrenci_adi || "Öğrenci"}! 👋`;
        }

        const completedTopicsEl = document.getElementById("total-completed-topics");
        if (completedTopicsEl) {
            completedTopicsEl.innerText = data.completedCount || 0;
        }

        const workHourWeekEl = document.getElementById("work-hour-week");
        if (workHourWeekEl) {
            workHourWeekEl.innerText = data.buHaftaSaat || 0;
        }

        const workHourAvgEl = document.getElementById("work-hour-avg");
        if (workHourAvgEl) {
            workHourAvgEl.innerText = data.gunlukOrtalama || 0;
        }

        const comparisonValueEl = document.getElementById("comparison-value");
        const comparisonTrendEl = document.getElementById("comparison-trend");

        if (comparisonValueEl) {
            comparisonValueEl.innerText = `${data.buHaftaSaat || 0} Saat`;
        }

        if (comparisonTrendEl) {
            const fark = data.haftalikFark || 0;

            if (data.durum === "artiş") {
                comparisonTrendEl.innerHTML = `
                    <i class="fas fa-rocket"></i>
                    <span>Geçen haftaya göre <strong>${fark} saat</strong> daha fazla çalıştın!</span>
                `;
                comparisonTrendEl.className = "trend-status growth-text";
            } else {
                comparisonTrendEl.innerHTML = `
                    <i class="fas fa-chart-line"></i>
                    <span>Geçen haftanın <strong>${fark} saat</strong> gerisindesin.</span>
                `;
                comparisonTrendEl.className = "trend-status decline-text";
            }
        }

        const progressData = data.progressData || {};

        renderDonut("tytChart", progressData.tyt?.labels || [], progressData.tyt?.values || []);
        renderDonut("aytSayChart", progressData.aytSay?.labels || [], progressData.aytSay?.values || []);
        renderDonut("aytEaChart", progressData.aytEa?.labels || [], progressData.aytEa?.values || []);
        renderDonut("aytSozChart", progressData.aytSoz?.labels || [], progressData.aytSoz?.values || []);
    } catch (err) {
        console.error("Dashboard hatası:", err);
    }
}

function renderDonut(canvasId, labels, values) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const oldChart = Chart.getChart(canvasId);
    if (oldChart) oldChart.destroy();

    const avgProgress =
        values.length > 0
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
            : 0;

    const chartColors = labels.map((label) => CONFIG.COLORS[label] || CONFIG.COLORS.Default);

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [
                {
                    data: values.length > 0 ? values : [1],
                    backgroundColor: values.length > 0 ? chartColors : ["#E5E7EB"],
                    borderWidth: 2,
                    borderRadius: 5
                }
            ]
        },
        options: {
            cutout: "75%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => ` ${context.label}: %${context.raw}`
                    }
                },
                centerText: {
                    display: true,
                    text: `%${avgProgress}`
                }
            }
        },
        plugins: [
            {
                id: "centerText",
                beforeDraw: (chart) => {
                    const { width, height, ctx } = chart;
                    ctx.save();
                    ctx.font = "bold 1.2rem sans-serif";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#1e293b";

                    const text = chart.options.plugins.centerText.text;
                    const textX = Math.round((width - ctx.measureText(text).width) / 2);
                    const textY = height / 1.95;

                    ctx.fillText(text, textX, textY);
                    ctx.restore();
                }
            }
        ]
    });
}

async function fetchWeeklyStudy(targetDate = new Date()) {
    try {
        const dateStr = apiTarihFormatla(targetDate);
        const response = await fetch(`${CONFIG.API_BASE}/gorev/weekly?date=${dateStr}`, { headers });

        if (!response.ok) {
            throw new Error("Haftalık çalışma verisi alınamadı.");
        }

        const data = await response.json();

        const ctx = document.getElementById("mainAnalysisChart");
        if (!ctx) return;

        const gunEtiketleri = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

        if (window.myMainChart) {
            window.myMainChart.destroy();
        }

        window.myMainChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: gunEtiketleri,
                datasets: [
                    {
                        label: "TYT",
                        data: data.tyt || [],
                        backgroundColor: "#FF8A5B",
                        borderRadius: 5
                    },
                    {
                        label: "AYT",
                        data: data.ayt || [],
                        backgroundColor: "#6366F1",
                        borderRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${value} sa`
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: "top",
                        align: "end"
                    }
                }
            }
        });
    } catch (err) {
        console.error("Grafik hatası:", err);
    }
}

window.changeChartWeek = function (offset) {
    grafikReferansTarih.setDate(grafikReferansTarih.getDate() + offset);
    fetchWeeklyStudy(grafikReferansTarih);
};

async function fetchDenemeNetleri() {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/gorev/deneme`, { headers });

        if (!response.ok) {
            throw new Error("Deneme verileri alınamadı.");
        }

        const data = await response.json();

        const tytEl = document.getElementById("last-tyt-net");
        const aytEl = document.getElementById("last-ayt-net");

        if (tytEl) tytEl.innerText = data.tyt || "-";
        if (aytEl) aytEl.innerText = data.ayt || "-";
    } catch (err) {
        console.error("Deneme hatası:", err);
    }
}

function sayfayiGuncelle(tarih) {
    const display = document.getElementById("currentDateDisplay");
    if (display) {
        display.innerText = tarih.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    renderWeeklyCalendar(tarih);
    fetchGorevlerByTarih(tarih);
}

function renderWeeklyCalendar(secilenTarih) {
    const weeklyDays = document.getElementById("weeklyDays");
    if (!weeklyDays) return;

    weeklyDays.innerHTML = "";

    let startOfWeek = new Date(secilenTarih);
    const dayDiff = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1;
    startOfWeek.setDate(startOfWeek.getDate() - dayDiff);

    for (let i = 0; i < 7; i++) {
        let gun = new Date(startOfWeek);
        gun.setDate(startOfWeek.getDate() + i);

        const isActive = gun.toDateString() === secilenTarih.toDateString();

        const dayEl = document.createElement("div");
        dayEl.className = `day-item ${isActive ? "active" : ""}`;
        dayEl.innerHTML = `
            <span>${gun.getDate()}</span>
            <p>${gun.toLocaleDateString("tr-TR", { weekday: "short" })}</p>
        `;

        dayEl.onclick = () => {
            aktifTarih = new Date(gun);
            sayfayiGuncelle(aktifTarih);
        };

        weeklyDays.appendChild(dayEl);
    }
}

async function fetchGorevlerByTarih(tarih) {
    const key = apiTarihFormatla(tarih);

    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const secilen = new Date(tarih);
    secilen.setHours(0, 0, 0, 0);

    try {
        const response = await fetch(`${CONFIG.API_BASE}/gorev/${key}`, { headers });

        if (!response.ok) {
            throw new Error("Görev listesi alınamadı.");
        }

        const data = await response.json();
        const list = document.getElementById("dynamicTaskList");

        if (!list) return;

        list.innerHTML = "";

        data.forEach((g) => {
            const isDone = g.yapildi_mi == 1 || g.yapildi_mi === true;

            let icon = "";
            if (isDone) {
                icon = `<i class="fas fa-check-circle" style="color: #3B82F6;"></i>`;
            } else if (secilen < bugun) {
                icon = `<i class="fas fa-frown" style="color: #EF4444;"></i>`;
            } else {
                icon = `<input type="checkbox" ${isDone ? "checked" : ""} onchange="updateTaskStatus(${g.gorev_id}, this.checked)">`;
            }

            let statusClass = "";
            if (isDone) {
                statusClass = "task-done-blue";
            } else if (secilen < bugun) {
                statusClass = "task-missed-red";
            }

            list.innerHTML += `
                <li class="task-item ${statusClass}">
                    <div class="task-left">
                        ${icon}
                        <span class="task-text">${g.baslik}</span>
                    </div>
                    ${secilen >= bugun
                    ? `<button onclick="deleteTask(${g.gorev_id})" class="delete-mini-btn">
                                    <i class="fas fa-trash-alt"></i>
                               </button>`
                    : ""
                }
                </li>
            `;
        });

        updateTodoProgress(data);
    } catch (err) {
        console.error("Liste hatası:", err);
    }
}

function updateTodoProgress(gorevler) {
    const percentEl = document.getElementById("todo-percent");
    const fillEl = document.getElementById("todo-progress-fill");

    if (!percentEl || !fillEl) return;

    const completed = (gorevler || []).filter((g) => g.yapildi_mi == 1 || g.yapildi_mi === true).length;
    const percent = gorevler && gorevler.length > 0 ? Math.round((completed / gorevler.length) * 100) : 0;

    percentEl.innerText = percent;
    fillEl.style.width = `${percent}%`;
}

function updateTimer() {
    const examDate = new Date("June 21, 2026 10:15:00").getTime();
    const now = new Date().getTime();
    const diff = examDate - now;

    const timerEl = document.getElementById("yks-timer-display");
    if (!timerEl) return;

    if (diff < 0) {
        timerEl.innerText = "Sınav Başladı! Başarılar. 🍀";
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    timerEl.innerText = `${d} Gün ${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
}

function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastOut 0.4s ease-in forwards";
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function showConfirmToast(message, onConfirm) {
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast confirm-toast";

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-trash-alt" style="color: #EF4444;"></i>
            <span>${message}</span>
        </div>
        <div class="toast-actions">
            <button class="toast-btn cancel">İptal</button>
            <button class="toast-btn confirm">Sil</button>
        </div>
    `;

    container.appendChild(toast);

    toast.querySelector(".cancel").onclick = () => {
        toast.style.animation = "toastOut 0.3s ease-in forwards";
        setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector(".confirm").onclick = () => {
        onConfirm();
        toast.remove();
    };
}