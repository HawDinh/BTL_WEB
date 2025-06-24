// Hàm load toàn bộ dữ liệu lịch hẹn
function loadAllBookings() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'Đăng nhập.html';
        return;
    }

    // Hiển thị loading spinner
    document.getElementById('loading').style.display = 'block';

    fetch("http://localhost:8080/api/appointments/get_all_appointment", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'Đăng nhập.html';
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        if (!response.ok) {
            throw new Error(`Lỗi lấy danh sách lịch: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderBookings(data);
        updateStats(data); // Cập nhật thống kê
    })
    .catch(error => {
        console.error("Lỗi:", error);
        if (!error.message.includes('hết hạn')) {
            showError("Không thể tải danh sách lịch.");
        }
    })
    .finally(() => {
        // Ẩn loading spinner
        document.getElementById('loading').style.display = 'none';
    });
}

// Hàm hiển thị dữ liệu lên bảng
function renderBookings(bookings) {
    const tableBody = document.querySelector("#bookingTable tbody");
    tableBody.innerHTML = "";

    bookings.forEach(booking => {
        const row = document.createElement("tr");
        row.dataset.id = booking.id;

        const cells = [
            { content: booking.petName || "N/A" },
            { content: booking.ownerName || "N/A" },
            { content: formatDate(booking.appointmentDateTime) },
            { content: booking.status || "N/A" },
            { 
                content: createStatusBadge(booking.status),
                className: 'status-cell'
            },
            {
                content: createActionButton(booking),
                className: 'action-cell'
            }
        ];

        cells.forEach(cell => {
            const td = document.createElement("td");
            if (typeof cell.content === 'string') {
                td.textContent = cell.content;
            } else {
                td.appendChild(cell.content);
            }
            if (cell.className) {
                td.className = cell.className;
            }
            row.appendChild(td);
        });

        tableBody.appendChild(row);
    });
}

// Tạo badge trạng thái
function createStatusBadge(status) {
    const badge = document.createElement("span");
    badge.className = `status-badge ${status === "Checked In" ? "status-checked" : "status-waiting"}`;
    badge.textContent = status === "Checked In" ? "Đã check-in" : "Đang chờ";
    return badge;
}

// Tạo nút thao tác
function createActionButton(booking) {
    const button = document.createElement("button");
    button.className = "action-btn";
    button.innerHTML = booking.status === "Checked In" 
        ? '<i class="fas fa-times"></i> Hủy check-in'
        : '<i class="fas fa-check"></i> Check-in';
    
    button.addEventListener("click", () => handleCheckIn(booking.id, booking.status !== "Checked In"));
    return button;
}

// Hàm chuyển đổi định dạng ngày giờ
function formatDate(dateTime) {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}-${month}-${year}`;
}

// Hàm xử lý check-in
function handleCheckIn(appointmentId, isChecking) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'Đăng nhập.html';
        return;
    }

    const endpoint = isChecking 
        ? `http://localhost:8080/api/appointments/check_in/${appointmentId}`
        : `http://localhost:8080/api/appointments/cancel_check_in/${appointmentId}`;

    fetch(endpoint, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'Đăng nhập.html';
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || "Lỗi không xác định từ server");
            });
        }
        showSuccess(isChecking ? "Check-in thành công!" : "Hủy check-in thành công!");
        loadAllBookings();
    })
    .catch(error => {
        console.error("Lỗi khi cập nhật check-in:", error);
        if (!error.message.includes('hết hạn')) {
            showError(error.message || `Không thể ${isChecking ? 'check-in' : 'hủy check-in'}.`);
            loadAllBookings();
        }
    });
}

// Hàm cập nhật thống kê
function updateStats(bookings) {
    const today = new Date().setHours(0,0,0,0);
    
    const todayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDateTime).setHours(0,0,0,0);
        return bookingDate === today;
    });

    const checkedInBookings = bookings.filter(booking => booking.status === "Checked In");
    const waitingBookings = bookings.filter(booking => booking.status !== "Checked In");

    document.getElementById('todayCount').textContent = todayBookings.length;
    document.getElementById('checkedInCount').textContent = checkedInBookings.length;
    document.getElementById('waitingCount').textContent = waitingBookings.length;
}

// Hàm hiển thị thông báo lỗi
function showError(message) {
    alert(message);
}

// Hàm hiển thị thông báo thành công
function showSuccess(message) {
    alert(message);
}

// Hàm lọc bảng theo tìm kiếm
function filterTable() {
    const input = document.getElementById('search');
    const filter = input.value.toLowerCase();
    const tbody = document.querySelector("#bookingTable tbody");
    const rows = tbody.getElementsByTagName("tr");

    for (let row of rows) {
        const petName = row.cells[0].textContent.toLowerCase();
        const userName = row.cells[1].textContent.toLowerCase();
        if (petName.includes(filter) || userName.includes(filter)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    }
}

// Khởi tạo khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    loadAllBookings();
});
