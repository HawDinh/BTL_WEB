document.addEventListener("DOMContentLoaded", function() {
    // Kiểm tra người dùng đã đăng nhập chưa
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Bạn cần đăng nhập để đặt lịch khám!");
        window.location.href = "Đăng nhập.html"; // Chuyển đến trang đăng nhập
        return;
    }

    // Kiểm tra token hết hạn
    checkTokenValidity();

    // Lấy thông tin người dùng hiện tại và điền vào form
    loadUserInfo();
    
    // Tải danh sách bác sĩ
    loadDoctorList();
    
    // Xử lý form đăng ký lịch
    setupAppointmentForm();
    
    // Xử lý nút kiểm tra kết nối API
    document.getElementById("test-connection").addEventListener("click", testApiConnection);
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

// Ẩn thông báo xác thực ban đầu
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

// Hàm kiểm tra kết nối API
function testApiConnection() {
    const connectionStatus = document.getElementById("connection-status");
    const testButton = document.getElementById("test-connection");
    const originalText = testButton.innerHTML;
    
    // Hiển thị trạng thái đang kiểm tra
    connectionStatus.textContent = "Đang kiểm tra kết nối...";
    connectionStatus.className = "connection-status loading";
    testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...';
    testButton.disabled = true;
    
    // Kiểm tra độ trễ
    const startTime = new Date().getTime();
    
    // Gọi API test
    fetch("http://localhost:8080/api/appointments/get_all_appointment", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Lỗi xác thực: Bạn cần đăng nhập lại!");
            }
            throw new Error(`Lỗi kết nối: Mã lỗi ${response.status}`);
        }
        return response.json().then(data => ({ data, responseTime }));
    })
    .then(({ data, responseTime }) => {
        // Kết nối thành công
        connectionStatus.innerHTML = `
            <i class="fas fa-check-circle"></i> Kết nối thành công! 
            <br>Thời gian phản hồi: ${responseTime}ms
            <br>Số lịch hẹn hiện có: ${Array.isArray(data) ? data.length : 'N/A'}
        `;
        connectionStatus.className = "connection-status success";
    })
    .catch(error => {
        // Kết nối thất bại
        connectionStatus.innerHTML = `
            <i class="fas fa-times-circle"></i> Kết nối thất bại! 
            <br>Lỗi: ${error.message}
            <br>Vui lòng kiểm tra cài đặt kết nối hoặc liên hệ hỗ trợ.
        `;
        connectionStatus.className = "connection-status error";
        console.error("API Connection Test Error:", error);
        
        // Nếu lỗi xác thực, yêu cầu đăng nhập lại
        if (error.message.includes("xác thực")) {
            showAuthAlert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!", "error");
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = "Đăng nhập.html";
            }, 2000);
        }
    })
    .finally(() => {
        // Khôi phục trạng thái nút
        testButton.innerHTML = originalText;
        testButton.disabled = false;
    });
}

// Hàm tải thông tin người dùng từ token
function loadUserInfo() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); // Được lưu khi đăng nhập
    
    if (username) {
        document.getElementById("username").value = username;
        
        // Tải danh sách thú cưng của người dùng
        loadUserPets(username);
    } else {
        // Cố gắng lấy thông tin người dùng từ API nếu có token nhưng không có username
        fetch("http://localhost:8080/api/users/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token không hợp lệ
                    throw new Error("Phiên đăng nhập hết hạn");
                }
                throw new Error("Không thể lấy thông tin người dùng");
            }
            return response.json();
        })
        .then(user => {
            if (user && user.username) {
                localStorage.setItem('username', user.username);
                document.getElementById("username").value = user.username;
                loadUserPets(user.username);
            }
        })
        .catch(error => {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            if (error.message === "Phiên đăng nhập hết hạn") {
                localStorage.removeItem('token');
                showAuthAlert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!", "error");
                setTimeout(() => {
                    window.location.href = "Đăng nhập.html";
                }, 2000);
            }
        });
    }
}

// Hàm tải danh sách thú cưng của người dùng để hiển thị gợi ý
function loadUserPets(username) {
    fetch(`http://localhost:8080/api/pets/owner/${username}`, {
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
            throw new Error("Không thể tải danh sách thú cưng");
        }
        return response.json();
    })
    .then(data => {
        // Hiển thị gợi ý bằng datalist
        if (data && data.length > 0) {
            // Tạo datalist cho input tên thú cưng
            let datalist = document.createElement("datalist");
            datalist.id = "pet-list";
            
            data.forEach(pet => {
                let option = document.createElement("option");
                option.value = pet.name;
                option.dataset.age = pet.age || "";
                datalist.appendChild(option);
            });
            
            document.body.appendChild(datalist);
            document.getElementById("petName").setAttribute("list", "pet-list");
            
            // Thêm sự kiện để tự động điền tuổi thú cưng khi chọn tên
            document.getElementById("petName").addEventListener("change", function() {
                const selectedOption = Array.from(datalist.options).find(option => option.value === this.value);
                if (selectedOption && selectedOption.dataset.age) {
                    document.getElementById("petAge").value = selectedOption.dataset.age;
                }
            });
            
            // Hiển thị thông báo thành công
            showAuthAlert(`Đã tải ${data.length} thú cưng từ tài khoản của bạn.`, "success");
        } else {
            showAuthAlert("Bạn chưa có thú cưng nào trong hệ thống.", "warning");
        }
    })
    .catch(error => {
        console.error("Lỗi khi tải danh sách thú cưng:", error);
        if (error.message === "Phiên đăng nhập hết hạn") {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            showAuthAlert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!", "error");
            setTimeout(() => {
                window.location.href = "Đăng nhập.html";
            }, 2000);
        } else {
            showAuthAlert(`Không thể tải dữ liệu thú cưng: ${error.message}`, "error");
        }
    });
}

// Hàm gọi API lấy danh sách bác sĩ và hiển thị trong select box
function loadDoctorList() {
    fetch("http://localhost:8080/api/doctors/get_all_appointment", {
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
            throw new Error("Không thể tải danh sách bác sĩ");
        }
        return response.json();
    })
    .then(data => {
        const doctorSelect = document.getElementById("doctor");
        
        // Xóa các bác sĩ cũ nếu đã có
        doctorSelect.innerHTML = '<option value="null">Không ưu tiên</option>';

        // Thêm từng bác sĩ vào select box
        if (Array.isArray(data)) {
        data.forEach(doctor => {
            const option = document.createElement("option");
                option.value = doctor.id;
                option.textContent = `${doctor.name} (${doctor.experience || "Chuyên gia"})`;
            doctorSelect.appendChild(option);
        });
        } else {
            console.warn("Dữ liệu bác sĩ không phải là mảng:", data);
        }
    })
    .catch(error => {
        console.error("Lỗi khi tải danh sách bác sĩ:", error);
        if (error.message === "Phiên đăng nhập hết hạn") {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            showAuthAlert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!", "error");
            setTimeout(() => {
                window.location.href = "Đăng nhập.html";
            }, 2000);
        } else {
            showAuthAlert(`Không thể tải danh sách bác sĩ: ${error.message}`, "error");
        }
    });
}

// Thiết lập xử lý form đăng ký lịch
function setupAppointmentForm() {
    const form = document.getElementById("appointment-form");
    
    form.addEventListener("submit", function(event) {
        event.preventDefault();

    // Lấy giá trị từ các trường input
    const username = document.getElementById("username").value;
    const petName = document.getElementById("petName").value;
    const petAge = parseInt(document.getElementById("petAge").value);
    const appointmentDate = document.getElementById("appointmentDate").value;
    const appointmentTime = document.getElementById("appointmentTime").value;
        const doctorId = document.getElementById("doctor").value;
    const note = document.getElementById("note").value;

    // Kiểm tra nếu người dùng không nhập đủ thông tin
        if (!username || !petName || isNaN(petAge) || !appointmentDate || !appointmentTime) {
            showAuthAlert("Vui lòng điền đầy đủ thông tin!", "warning");
        return;
    }

    // Kiểm tra tuổi của thú cưng
    if (petAge <= 0) {
            showAuthAlert("Tuổi của thú cưng phải lớn hơn 0!", "warning");
        return;
    }

    // Kiểm tra ngày hẹn không phải ngày trong quá khứ
    const currentDate = new Date();
        const selectedDate = new Date(`${appointmentDate}T${appointmentTime}`);
        
        if (selectedDate < currentDate) {
            showAuthAlert("Thời gian hẹn không thể trong quá khứ!", "warning");
        return;
    }

        // Kiểm tra token trước khi gửi
        const token = localStorage.getItem('token');
        if (!token) {
            showAuthAlert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", "error");
            setTimeout(() => {
                window.location.href = "Đăng nhập.html";
            }, 2000);
            return;
        }

        // Hiển thị thông báo đang xử lý
        showAuthAlert("Đang đăng ký lịch khám...", "warning");

        // Tạo object dữ liệu gửi API theo cấu trúc AppointmentRequest
    const formData = {
            ownerName: username,                 // Tên người đăng ký (username)
        petName: petName,                    // Tên thú cưng
        petAge: petAge,                      // Tuổi thú cưng
            appointmentDateTime: `${appointmentDate}T${appointmentTime}:00`, // Ngày giờ hẹn
            notes: note,                         // Ghi chú (backend dùng notes thay vì note)
            preferredDoctorId: doctorId === "null" ? null : parseInt(doctorId) // ID bác sĩ
        };

        // Hiển thị trạng thái đang xử lý
        const submitButton = document.getElementById("registerButton");
        const originalText = submitButton.innerText;
        submitButton.innerText = "Đang đăng ký...";
        submitButton.disabled = true;

        // Gửi request POST đến API đăng ký lịch
        fetch("http://localhost:8080/api/appointments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("Lỗi quyền truy cập: Bạn không có quyền thực hiện hành động này hoặc phiên đăng nhập đã hết hạn");
                }
            return response.json().then(err => {
                    throw new Error(err.message || "Lỗi từ server");
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Dữ liệu phản hồi từ API:", data);
            showAuthAlert("Đăng ký lịch thành công! Vui lòng kiểm tra theo dõi lịch hẹn của bạn.", "success");
            
            // Làm trống form sau khi đăng ký thành công
            form.reset();
    })
    .catch(error => {
            console.error("Lỗi khi đăng ký lịch:", error);
            
            // Xử lý lỗi quyền truy cập
            if (error.message.includes("quyền truy cập") || error.message.includes("hết hạn")) {
                showAuthAlert("Phiên đăng nhập của bạn đã hết hạn hoặc bạn không có quyền thực hiện hành động này. Vui lòng đăng nhập lại!", "error");
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                setTimeout(() => {
                    window.location.href = "Đăng nhập.html";
                }, 3000);
            } else {
                showAuthAlert("Có lỗi xảy ra: " + error.message, "error");
            }
        })
        .finally(() => {
            // Khôi phục trạng thái nút đăng ký
            submitButton.innerText = originalText;
            submitButton.disabled = false;
        });
    });
}
