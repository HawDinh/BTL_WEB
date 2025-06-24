document.addEventListener("DOMContentLoaded", function() {
    // Kiểm tra người dùng đã đăng nhập chưa
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Bạn cần đăng nhập để xem lịch hẹn!");
        window.location.href = "Đăng nhập.html";
        return;
    }

    // Kiểm tra token hết hạn
    checkTokenValidity();

    // Thiết lập các sự kiện và tải dữ liệu
    setupFilterEvents();
    loadAppointments();
    
    // Thiết lập sự kiện cho modal
    setupModalEvents();
});

// Hiển thị thông báo xác thực
function showAuthAlert(message, type = 'error') {
    const authAlert = document.getElementById('auth-alert');
    const authMessage = document.getElementById('auth-message');
    
    authMessage.textContent = message;
    
    // Xóa tất cả class hiện tại và thêm class mới dựa trên loại thông báo
    authAlert.className = 'auth-alert';
    if (type === 'success') {
        authAlert.classList.add('success');
    } else if (type === 'warning') {
        authAlert.classList.add('warning');
    }
    
    // Hiển thị thông báo
    authAlert.style.display = 'flex';
    
    // Tự động ẩn thông báo sau 5 giây nếu là thông báo thành công
    if (type === 'success') {
        setTimeout(() => {
            authAlert.style.display = 'none';
        }, 5000);
    }
}

// Ẩn thông báo xác thực
function hideAuthAlert() {
    const authAlert = document.getElementById('auth-alert');
    authAlert.style.display = 'none';
}

// Hàm kiểm tra tính hợp lệ của token
function checkTokenValidity() {
    const token = localStorage.getItem('token');
    
    // Hiển thị thông báo đang kiểm tra
    showAuthAlert("Đang kiểm tra phiên đăng nhập...", "warning");
    
    // Gọi API để kiểm tra token
    fetch("http://localhost:8080/auth/introspect", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => {
        if (!response.ok) {
            // Token không hợp lệ hoặc hết hạn
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            showAuthAlert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!", "error");
            setTimeout(() => {
                window.location.href = "Đăng nhập.html";
            }, 2000);
        } else {
            // Token hợp lệ, ẩn thông báo
            hideAuthAlert();
        }
    })
    .catch(error => {
        console.error("Lỗi kiểm tra token:", error);
        showAuthAlert("Không thể kiểm tra phiên đăng nhập. Vui lòng thử lại sau!", "error");
    });
}

// Thiết lập sự kiện cho bộ lọc
function setupFilterEvents() {
    // Lọc theo trạng thái
    document.getElementById('status-filter').addEventListener('change', function() {
        loadAppointments();
    });
    
    // Lọc theo ngày
    document.getElementById('date-filter').addEventListener('change', function() {
        loadAppointments();
    });
    
    // Xóa bộ lọc ngày
    document.getElementById('clear-date-filter').addEventListener('click', function() {
        document.getElementById('date-filter').value = '';
        loadAppointments();
    });
    
    // Tìm kiếm theo tên thú cưng
    document.getElementById('pet-search').addEventListener('input', function() {
        loadAppointments();
    });
}

// Tải danh sách lịch hẹn
function loadAppointments() {
    const username = localStorage.getItem('username');
    if (!username) {
        showAuthAlert("Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại!", "error");
        return;
    }
    
    const appointmentsList = document.getElementById('appointments-list');
    appointmentsList.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Đang tải lịch hẹn...</div>';
    
    // Lấy các giá trị lọc
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    const petNameFilter = document.getElementById('pet-search').value.toLowerCase();
    
    console.log("Đang tải lịch hẹn cho username:", username);
    console.log("Filters - Status:", statusFilter, "Date:", dateFilter, "Pet name:", petNameFilter);
    
    // Gọi API lấy danh sách lịch hẹn theo username
    fetch(`http://localhost:8080/api/appointments/user/${username}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Phiên đăng nhập hết hạn");
            }
            throw new Error(`Lỗi ${response.status}: Không thể tải danh sách lịch hẹn`);
        }
        return response.json();
    })
    .then(appointments => {
        console.log("Dữ liệu lịch hẹn từ server:", appointments);
        
        // Kiểm tra cấu trúc dữ liệu và chuyển đổi nếu cần
        let processedAppointments = Array.isArray(appointments) ? appointments : [];
        
        // Nếu dữ liệu trả về không phải là mảng mà là object có trường 'content'
        if (!Array.isArray(appointments) && appointments.content && Array.isArray(appointments.content)) {
            processedAppointments = appointments.content;
        }
        
        console.log("Số lượng lịch hẹn sau khi xử lý:", processedAppointments.length);
        
        // Kiểm tra thông tin pet trong lịch hẹn
        processedAppointments.forEach(appointment => {
            console.log(`Lịch hẹn #${appointment.id} - Pet name: ${appointment.petName}, Pet age: ${appointment.petAge}`);
        });
        
        // Lọc kết quả theo các bộ lọc
        let filteredAppointments = processedAppointments;
        
        // Lọc theo trạng thái
        if (statusFilter && statusFilter !== 'all') {
            filteredAppointments = filteredAppointments.filter(appointment => 
                appointment.status && appointment.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }
        
        // Lọc theo ngày
        if (dateFilter) {
            const filterDate = new Date(dateFilter).toISOString().split('T')[0];
            filteredAppointments = filteredAppointments.filter(appointment => {
                if (!appointment.appointmentDateTime) return false;
                const appointmentDate = new Date(appointment.appointmentDateTime).toISOString().split('T')[0];
                return appointmentDate === filterDate;
            });
        }
        
        // Lọc theo tên thú cưng
        if (petNameFilter) {
            filteredAppointments = filteredAppointments.filter(appointment => {
                // Kiểm tra nếu có thuộc tính pet và pet.name
                if (appointment.pet && appointment.pet.name) {
                    return appointment.pet.name.toLowerCase().includes(petNameFilter);
                }
                // Kiểm tra nếu có thuộc tính petName
                else if (appointment.petName) {
                    return appointment.petName.toLowerCase().includes(petNameFilter);
                }
                return false;
            });
        }
        
        console.log("Số lượng lịch hẹn sau khi lọc:", filteredAppointments.length);
        
        // Cập nhật thống kê
        updateStatistics(processedAppointments, filteredAppointments);
        
        // Hiển thị kết quả
        displayAppointments(filteredAppointments);
    })
    .catch(error => {
        console.error("Lỗi khi tải lịch hẹn:", error);
        appointmentsList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Không thể tải danh sách lịch hẹn.<br>${error.message}</p>
                <button onclick="loadAppointments()" class="btn-retry">Thử lại</button>
            </div>
        `;
        
        if (error.message === "Phiên đăng nhập hết hạn") {
            localStorage.removeItem('token');
            showAuthAlert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!", "error");
            setTimeout(() => {
                window.location.href = "Đăng nhập.html";
            }, 2000);
        }
    });
}

// Hiển thị danh sách lịch hẹn
function displayAppointments(appointments) {
    const appointmentsList = document.getElementById('appointments-list');
    
    if (!appointments || appointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="no-appointments">
                <i class="fas fa-calendar-times"></i>
                <p>Không có lịch hẹn nào phù hợp với bộ lọc của bạn.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Sắp xếp theo ngày gần nhất
    appointments.sort((a, b) => {
        if (!a.appointmentDateTime) return 1;
        if (!b.appointmentDateTime) return -1;
        return new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime);
    });
    
    appointments.forEach(appointment => {
        // Kiểm tra dữ liệu hợp lệ
        if (!appointment.id || !appointment.appointmentDateTime) {
            console.warn("Lịch hẹn không hợp lệ:", appointment);
            return;
        }
        
        // Định dạng ngày giờ
        const appointmentDate = new Date(appointment.appointmentDateTime);
        const formattedDate = appointmentDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const formattedTime = appointmentDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Xử lý tên thú cưng
        let petName = 'Không có thông tin';
        if (appointment.pet) {
            petName = appointment.pet.name || 'Không có tên';
        } else if (appointment.petName) {
            petName = appointment.petName;
        }
        
        // Xử lý tên bác sĩ
        let doctorName = 'Chưa chỉ định';
        if (appointment.doctor && appointment.doctor.name) {
            doctorName = appointment.doctor.name;
        } else if (appointment.preferredDoctor && appointment.preferredDoctor.name) {
            doctorName = appointment.preferredDoctor.name + " (ưu tiên)";
        }
        
        // Xác định class dựa trên trạng thái
        const status = appointment.status || 'Unknown';
        const statusClass = `status-${status.replace(/\s+/g, '-')}`;
        const cardClass = `appointment-card ${statusClass}`;
        
        // Tạo HTML cho card lịch hẹn
        html += `
            <div class="${cardClass}" data-id="${appointment.id}" onclick="openAppointmentDetail(${appointment.id})">
                <div class="appointment-header">
                    <h3>Lịch hẹn #${appointment.id}</h3>
                    <span class="appointment-status ${statusClass}">${getStatusText(status)}</span>
                </div>
                <div class="appointment-details">
                    <p>
                        <strong><i class="fas fa-calendar-day"></i> Ngày</strong>
                        ${formattedDate}
                    </p>
                    <p>
                        <strong><i class="fas fa-clock"></i> Giờ</strong>
                        ${formattedTime}
                    </p>
                    <p>
                        <strong><i class="fas fa-paw"></i> Thú cưng</strong>
                        ${petName}
                    </p>
                    <p>
                        <strong><i class="fas fa-user-md"></i> Bác sĩ</strong>
                        ${doctorName}
                    </p>
                </div>
                <div class="appointment-actions">
                    <button class="btn-view" onclick="event.stopPropagation(); openAppointmentDetail(${appointment.id})">
                        <i class="fas fa-eye"></i> Xem chi tiết
                    </button>
                    ${status === 'Scheduled' ? 
                        `<button class="btn-cancel" onclick="event.stopPropagation(); cancelAppointment(${appointment.id})">
                            <i class="fas fa-times"></i> Hủy lịch
                        </button>` : ''}
                </div>
            </div>
        `;
    });
    
    appointmentsList.innerHTML = html;
}

// Cập nhật thống kê
function updateStatistics(allAppointments, filteredAppointments) {
    const totalCount = document.getElementById('total-count');
    const scheduledCount = document.getElementById('scheduled-count');
    const completedCount = document.getElementById('completed-count');
    
    totalCount.textContent = filteredAppointments ? filteredAppointments.length : 0;
    
    if (allAppointments && allAppointments.length) {
        const scheduled = allAppointments.filter(a => a.status === 'Scheduled').length;
        const completed = allAppointments.filter(a => a.status === 'Completed').length;
        
        scheduledCount.textContent = scheduled;
        completedCount.textContent = completed;
    } else {
        scheduledCount.textContent = '0';
        completedCount.textContent = '0';
    }
}

// Lấy text trạng thái tiếng Việt
function getStatusText(status) {
    const statusMap = {
        'Scheduled': 'Đã lên lịch',
        'Checked In': 'Đã check-in',
        'In Progress': 'Đang khám',
        'Completed': 'Đã hoàn thành',
        'Cancelled': 'Đã hủy'
    };
    
    return statusMap[status] || status;
}

// Thiết lập sự kiện cho modal
function setupModalEvents() {
    // Lấy modal
    const modal = document.getElementById('appointment-detail-modal');
    
    // Lấy nút đóng
    const closeModal = document.querySelector('.close-modal');
    const closeDetailBtn = document.getElementById('close-detail');
    
    // Khi người dùng nhấp vào nút đóng
    closeModal.addEventListener('click', function() {
        modal.style.display = "none";
    });
    
    closeDetailBtn.addEventListener('click', function() {
        modal.style.display = "none";
    });
    
    // Khi người dùng nhấp vào bất kỳ đâu bên ngoài modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

// Mở chi tiết lịch hẹn
function openAppointmentDetail(appointmentId) {
    // Gọi API để lấy thông tin chi tiết của lịch hẹn
    fetch(`http://localhost:8080/api/appointments/get_appointment_by_id/${appointmentId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Lỗi ${response.status}: Không thể tải thông tin lịch hẹn`);
        }
        return response.json();
    })
    .then(appointment => {
        // Hiển thị thông tin chi tiết lịch hẹn trong modal
        displayAppointmentDetail(appointment);
        
        // Hiển thị modal
        document.getElementById('appointment-detail-modal').style.display = "block";
        
        // Thiết lập nút hủy lịch hẹn
        const cancelBtn = document.getElementById('cancel-appointment');
        if (appointment.status === 'Scheduled') {
            cancelBtn.style.display = "inline-block";
            cancelBtn.onclick = function() { cancelAppointment(appointmentId); };
        } else {
            cancelBtn.style.display = "none";
        }
    })
    .catch(error => {
        console.error("Lỗi khi tải thông tin chi tiết lịch hẹn:", error);
        showAuthAlert("Không thể tải thông tin chi tiết lịch hẹn. Vui lòng thử lại sau!", "error");
    });
}

// Hiển thị chi tiết lịch hẹn trong modal
function displayAppointmentDetail(appointment) {
    const detailContent = document.getElementById('appointment-detail-content');
    
    console.log("Chi tiết lịch hẹn:", appointment);
    
    // Định dạng ngày giờ
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const formattedDateTime = appointmentDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Định dạng ngày giờ tạo và cập nhật
    const createdAt = appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';
    
    const updatedAt = appointment.updatedAt ? new Date(appointment.updatedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';
    
    // Xử lý tên thú cưng và thông tin thú cưng
    let petName = 'Không có thông tin';
    let petAge = 'N/A';
    let petSpecies = 'N/A';
    let petBreed = 'N/A';
    
    if (appointment.pet) {
        petName = appointment.pet.name || 'Không có tên';
        petAge = appointment.petAge || 'N/A';
        petSpecies = appointment.pet.species || 'N/A';
        petBreed = appointment.pet.breed || 'N/A';
    } else {
        petName = appointment.petName || 'Không có thông tin';
        petAge = appointment.petAge ? `${appointment.petAge} tuổi` : 'N/A';
    }
    
    // Xử lý thông tin bác sĩ
    let doctorName = 'Chưa chỉ định';
    let preferredDoctorName = 'Không có';
    
    if (appointment.doctor && appointment.doctor.name) {
        doctorName = appointment.doctor.name;
    }
    
    if (appointment.preferredDoctor && appointment.preferredDoctor.name) {
        preferredDoctorName = appointment.preferredDoctor.name;
    }
    
    // Tạo HTML cho thông tin chi tiết
    let html = `
        <div class="detail-group">
            <h4><i class="fas fa-info-circle"></i> Thông tin chung</h4>
            <div class="detail-item">
                <div class="detail-label">Mã lịch hẹn:</div>
                <div class="detail-value">#${appointment.id}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Thời gian hẹn:</div>
                <div class="detail-value">${formattedDateTime}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Trạng thái:</div>
                <div class="detail-value">
                    <span class="appointment-status status-${appointment.status.replace(/\s+/g, '-')}">
                        ${getStatusText(appointment.status)}
                    </span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Tạo lúc:</div>
                <div class="detail-value">${createdAt}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Cập nhật lúc:</div>
                <div class="detail-value">${updatedAt}</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h4><i class="fas fa-paw"></i> Thông tin thú cưng</h4>
            <div class="detail-item">
                <div class="detail-label">Tên thú cưng:</div>
                <div class="detail-value">${petName}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Tuổi:</div>
                <div class="detail-value">${petAge}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Loài:</div>
                <div class="detail-value">${petSpecies}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Giống:</div>
                <div class="detail-value">${petBreed}</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h4><i class="fas fa-user-md"></i> Thông tin bác sĩ</h4>
            <div class="detail-item">
                <div class="detail-label">Bác sĩ khám:</div>
                <div class="detail-value">${doctorName}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Bác sĩ ưu tiên:</div>
                <div class="detail-value">${preferredDoctorName}</div>
            </div>
        </div>
    `;
    
    // Hiển thị dịch vụ nếu có
    if (appointment.service) {
        const serviceName = appointment.service.name || 'Không có thông tin';
        const serviceDesc = appointment.service.description || 'Không có mô tả';
        const servicePrice = appointment.service.price ? `${appointment.service.price.toLocaleString('vi-VN')} VNĐ` : 'Chưa có giá';
        
        html += `
            <div class="detail-group">
                <h4><i class="fas fa-heartbeat"></i> Thông tin dịch vụ</h4>
                <div class="detail-item">
                    <div class="detail-label">Tên dịch vụ:</div>
                    <div class="detail-value">${serviceName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Mô tả:</div>
                    <div class="detail-value">${serviceDesc}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Giá dịch vụ:</div>
                    <div class="detail-value">${servicePrice}</div>
                </div>
            </div>
        `;
    }
    
    // Hiển thị ghi chú nếu có
    if (appointment.notes) {
        html += `
            <div class="detail-group">
                <h4><i class="fas fa-sticky-note"></i> Ghi chú</h4>
                <div class="detail-item">
                    <div class="detail-value note-content">${appointment.notes}</div>
                </div>
            </div>
        `;
    }
    
    detailContent.innerHTML = html;
}

// Hủy lịch hẹn
function cancelAppointment(appointmentId) {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch hẹn này không?')) {
        return;
    }
    
    showAuthAlert("Đang hủy lịch hẹn...", "warning");
    
    // Gọi API để hủy lịch hẹn
    fetch(`http://localhost:8080/api/appointments/cancel/${appointmentId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Lỗi ${response.status}: Không thể hủy lịch hẹn`);
        }
        return response.json();
    })
    .then(data => {
        showAuthAlert("Đã hủy lịch hẹn thành công!", "success");
        
        // Đóng modal nếu đang mở
        document.getElementById('appointment-detail-modal').style.display = "none";
        
        // Tải lại danh sách lịch hẹn
        setTimeout(() => {
            loadAppointments();
        }, 1000);
    })
    .catch(error => {
        console.error("Lỗi khi hủy lịch hẹn:", error);
        showAuthAlert("Không thể hủy lịch hẹn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ!", "error");
    });
} 