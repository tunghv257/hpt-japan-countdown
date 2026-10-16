
/* ===== HPT JAPAN COUNTDOWN ===== */

const targetDate = new Date("2026-11-29T08:00:00+09:00");

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minsEl = document.getElementById("mins");
const secsEl = document.getElementById("secs");

const titleEl = document.getElementById("quote-main");
const subtitleEl = document.getElementById("quote-sub");
const timeBox = document.getElementById("time-box");

function formatTime(number) {
    return String(number).padStart(2, "0");
}

function updateCountdown() {
    const now = new Date();
    const distance = targetDate.getTime() - now.getTime();

    // ===== WELCOME TO JAPAN =====
    if (distance <= 0) {
        titleEl.textContent = "Welcome to Japan! 🍁";

        subtitleEl.textContent =
            "Khách VIP HPT đã chính thức đến Nhật!!! 🇯🇵";

        // Ẩn đồng hồ đếm ngược
        timeBox.style.display = "none";

        // Thêm hiệu ứng cho màn hình chào mừng
        titleEl.classList.add("welcome-title");
        subtitleEl.classList.add("welcome-subtitle");

        clearInterval(timerId);
        return;
    }

    // ===== COUNTDOWN =====
    const totalSeconds = Math.floor(distance / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    daysEl.textContent = formatTime(days);
    hoursEl.textContent = formatTime(hours);
    minsEl.textContent = formatTime(mins);
    secsEl.textContent = formatTime(secs);
}

// Cập nhật mỗi giây
const timerId = setInterval(updateCountdown, 1000);

// Chạy ngay khi mở trang
updateCountdown();
