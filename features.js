
/* ==================================
   1. PAGE NAVIGATION
================================== */

const pages = {
    home: document.getElementById("main"),
    checklist: document.getElementById("checklist"),
    setting: document.getElementById("setting")
};

function showPage() {
    const hash = window.location.hash.replace("#", "");
    const page = pages[hash] ? hash : "home";

    Object.entries(pages).forEach(([name, element]) => {
        element.hidden = name !== page;
    });

    document.querySelectorAll(".option-item").forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + page
        );
    });
}

window.addEventListener("hashchange", showPage);
showPage();


/* ==================================
   2. CHECKLIST CRUD
================================== */

const CHECKLIST_KEY = "hpt-checklist-v1";

const defaultTasks = [
    { id: "1", text: "Hộ chiếu & Visa", done: false },
    { id: "2", text: "Vé máy bay", done: false },
    { id: "3", text: "Quần áo mùa đông", done: false },
    { id: "4", text: "Đồ dùng cá nhân", done: false },
    { id: "5", text: "SIM / Internet", done: false },
    { id: "6", text: "Chuẩn bị tinh thần đi chơi 🍁", done: false }
];

// Đọc checklist đã lưu
function loadChecklist() {
    try {
        const saved = localStorage.getItem(CHECKLIST_KEY);

        if (saved !== null) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (error) {
        console.error("Cannot load checklist:", error);
    }

    return defaultTasks.map(task => ({ ...task }));
}

let tasks = loadChecklist();

const checklistItems = document.getElementById("checklist-items");
const progressText = document.getElementById("check-progress");

// Lưu checklist
function saveChecklist() {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(tasks));
}

// Render toàn bộ checklist
function renderChecklist() {
    checklistItems.replaceChildren();

    tasks.forEach(task => {
        const row = document.createElement("div");
        row.className = "check-item";

        if (task.done) row.classList.add("done");

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.id = "task-" + task.id;

        checkbox.addEventListener("change", () => {
            task.done = checkbox.checked;
            saveChecklist();
            renderChecklist();
        });

        // Nội dung
        const label = document.createElement("label");
        label.className = "check-text";
        label.htmlFor = checkbox.id;
        label.textContent = task.text;

        // Nút sửa
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "task-btn";
        editBtn.textContent = "Sửa";

        let editing = false;
        let editInput;

        editBtn.addEventListener("click", () => {
            if (!editing) {
                editing = true;

                editInput = document.createElement("input");
                editInput.type = "text";
                editInput.className = "edit-input";
                editInput.value = task.text;
                editInput.maxLength = 80;

                row.replaceChild(editInput, label);
                editBtn.textContent = "Lưu";

                editInput.focus();
                editInput.select();

                editInput.addEventListener("keydown", event => {
                    if (event.key === "Enter") {
                        editBtn.click();
                    }

                    if (event.key === "Escape") {
                        renderChecklist();
                    }
                });

            } else {
                const newText = editInput.value.trim();

                if (!newText) {
                    editInput.focus();
                    return;
                }

                task.text = newText;
                saveChecklist();
                renderChecklist();
            }
        });

        // Nút xóa
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "task-btn";
        deleteBtn.textContent = "Xóa";

        deleteBtn.addEventListener("click", () => {
            if (!confirm("Xóa mục này nhé?")) return;

            tasks = tasks.filter(item => item.id !== task.id);

            saveChecklist();
            renderChecklist();
        });

        row.append(checkbox, label, editBtn, deleteBtn);
        checklistItems.appendChild(row);
    });

    // Cập nhật tiến độ
    const completed = tasks.filter(task => task.done).length;

    progressText.textContent =
        `${completed}/${tasks.length} món đã chuẩn bị`;
}

// Thêm mục mới
document.getElementById("task-form").addEventListener(
    "submit",
    event => {
        event.preventDefault();

        const input = document.getElementById("new-task");
        const text = input.value.trim();

        if (!text) return;

        tasks.push({
            id: Date.now().toString() +
                Math.random().toString(36).slice(2),
            text: text,
            done: false
        });

        saveChecklist();
        renderChecklist();

        input.value = "";
    }
);

renderChecklist();


/* ==================================
   3. BACKGROUND SETTING
================================== */

const BG_KEY = "hpt-background-v1";

const container = document.querySelector(".container");
const bgInput = document.getElementById("background-input");
const bgStatus = document.getElementById("bg-status");

// Đặt ảnh nền
function setBackground(dataUrl) {
    container.style.setProperty(
        "--bg-image",
        `url("${dataUrl}")`
    );
}

// Khôi phục ảnh đã lưu
try {
    const savedBg = localStorage.getItem(BG_KEY);
    if (savedBg) setBackground(savedBg);
} catch (error) {
    console.error("Cannot load background:", error);
}

// Người dùng chọn ảnh mới
bgInput.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        bgStatus.textContent = "Vui lòng chọn một file ảnh nhé.";
        return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
        // Thu nhỏ ảnh để tiết kiệm dung lượng lưu trữ
        const scale = Math.min(
            1,
            1400 / Math.max(image.width, image.height)
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);

        URL.revokeObjectURL(objectUrl);

        try {
            localStorage.setItem(BG_KEY, dataUrl);
            setBackground(dataUrl);

            bgStatus.textContent = "🍁 Đổi hình nền thành công!";
        } catch (error) {
            bgStatus.textContent =
                "Không đủ dung lượng lưu ảnh. Thử ảnh nhỏ hơn nhé.";
        }

        bgInput.value = "";
    };

    image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        bgStatus.textContent = "Không mở được ảnh này.";
    };

    image.src = objectUrl;
});

// Khôi phục background mặc định
document.getElementById("reset-background")
    .addEventListener("click", () => {

        localStorage.removeItem(BG_KEY);

        container.style.removeProperty("--bg-image");

        bgStatus.textContent =
            "Đã trở về Phú Sĩ mùa thu 🍁";
    });
