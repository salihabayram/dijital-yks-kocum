const API_BASE = "/api/takvim";

const mainCalendar = document.getElementById('mainCalendar');
const miniCalendar = document.getElementById('miniCalendar');
const datePicker = document.getElementById('datePicker');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const toast = document.getElementById('toast');

let dbTasks = {};

let todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

let selectedDate = new Date();
selectedDate.setHours(0, 0, 0, 0);

datePicker.value = dateToInputValue(selectedDate);

async function init() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = "/";
        return;
    }

    await fetchTasksFromDB();
    renderCalendars();

    datePicker.addEventListener('change', (e) => {
        selectedDate = inputValueToDate(e.target.value);
        renderCalendars();
    });

    addTaskBtn.addEventListener('click', addTask);
}

async function fetchTasksFromDB() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Takvim görevleri alınamadı.");
            dbTasks = {};
            return;
        }

        dbTasks = await response.json();
    } catch (error) {
        console.error("Veritabanı bağlantı hatası:", error);
        dbTasks = {};
    }
}

function renderCalendars() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    miniCalendar.innerHTML = '';
    mainCalendar.innerHTML = '';

    const priorityDots = {
        'DÜŞÜK': '🟢',
        'ORTA': '🟡',
        'YÜKSEK': '🔴'
    };

    for (let x = 0; x < startOffset; x++) {
        const emptyBox = document.createElement('div');
        emptyBox.className = 'day-box empty';
        mainCalendar.appendChild(emptyBox);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);

        const miniDay = document.createElement('div');
        miniDay.className = 'mini-day';
        miniDay.innerText = day;

        if (dateStr === datePicker.value) {
            miniDay.classList.add('selected');
        }

        miniDay.addEventListener('click', () => {
            datePicker.value = dateStr;
            selectedDate = inputValueToDate(dateStr);
            renderCalendars();
        });

        miniCalendar.appendChild(miniDay);

        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';

        if (dateStr === datePicker.value) {
            dayBox.classList.add('selected-frame');
        }

        const todayStr = dateToInputValue(todayDate);

        if (dateStr === todayStr) {
            dayBox.classList.add('today-highlight');
        }

        dayBox.innerHTML = `<span>${day}</span>`;

        if (dbTasks[dateStr] && Array.isArray(dbTasks[dateStr])) {
            dbTasks[dateStr].forEach((task) => {
                const pill = document.createElement('div');

                const priorityClass = task.priority || 'ORTA';
                const dot = priorityDots[priorityClass] || '⚪';

                pill.className = `task-pill ${task.status === 'done' ? 'completed' : ''} priority-${priorityClass}`;

                pill.innerHTML = `
                    <span class="task-text">${dot} ${task.text}</span>
                    <button class="delete-btn" type="button" data-id="${task.id}">×</button>
                `;

                const deleteBtn = pill.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => {
                    deleteTask(task.id);
                });

                dayBox.appendChild(pill);
            });
        }

        mainCalendar.appendChild(dayBox);
    }
}

async function addTask() {
    const text = taskInput.value.trim();
    const dateStr = datePicker.value;
    const priority = document.getElementById('priorityInput').value;

    if (!text) {
        showToast("Lütfen görev girin.");
        return;
    }

    const chosenDate = inputValueToDate(dateStr);
    chosenDate.setHours(0, 0, 0, 0);

    if (chosenDate < todayDate) {
        showToast("Geçmiş tarihlere görev ekleyemezsiniz!");
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/add-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text,
                date: dateStr,
                priority
            })
        });

        if (!response.ok) {
            showToast("Görev eklenemedi.");
            return;
        }

        taskInput.value = '';

        await fetchTasksFromDB();
        renderCalendars();
    } catch (error) {
        console.error("Kayıt hatası:", error);
        showToast("Sunucuya bağlanılamadı.");
    }
}

async function deleteTask(gorevId) {
    if (!confirm("Bu görevi silmek istediğine emin misin?")) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gorevId
            })
        });

        if (!response.ok) {
            showToast("Görev silinemedi.");
            return;
        }

        await fetchTasksFromDB();
        renderCalendars();
    } catch (error) {
        console.error("Silme işlemi başarısız:", error);
        showToast("Sunucuya bağlanılamadı.");
    }
}

function showToast(message) {
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

function dateToInputValue(date) {
    return formatDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function inputValueToDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

init();