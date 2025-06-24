// Lưu trữ doctorId vào localStorage khi cài đặt bác sĩ
let doctorId = null;

// Khi nhấn vào nút "Cài đặt", hiển thị overlay
document.getElementById("set-dotor-btn").addEventListener("click", function () {
    const overlay = document.getElementById("settings-overlay");

    // Hiển thị overlay khi bấm nút "Cài đặt"
    overlay.classList.add('show');

    // Clear các input trong overlay để người dùng nhập lại thông tin
    document.getElementById("doctor-id").value = '';
    document.getElementById("doctor-status").value = '';
});

// Khi nhấn nút "Hoàn Tất" trong overlay
document.getElementById("submit-btn").addEventListener("click", function () {
    const doctorIdInput = document.getElementById("doctor-id").value;
    const doctorStatus = document.getElementById("doctor-status").value;

    const overlay = document.getElementById("settings-overlay");

    // Kiểm tra xem ID và trạng thái bác sĩ đã nhập đầy đủ chưa
    if (!doctorIdInput || !doctorStatus) {
        alert("Vui lòng nhập đầy đủ ID và trạng thái bác sĩ.");
        return;
    }

    // Lưu doctorId vào localStorage để sử dụng sau
    localStorage.setItem('doctorId', doctorIdInput);
    doctorId = doctorIdInput; // Cập nhật giá trị doctorId

    // Gọi API PUT để cập nhật trạng thái bác sĩ
    const url = `http://localhost:8080/api/doctors/set_status_doctor/${doctorId}/${doctorStatus}`;

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Sử dụng token từ localStorage
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Lỗi khi gọi API set_status_doctor');
        }
        return response.json();
    })
    .then(data => {
        alert(`Trạng thái bác sĩ đã được cập nhật thành: ${doctorStatus}`);

        // Lấy thông tin bác sĩ qua doctorId để lưu room vào localStorage
        const doctorDetailsUrl = `http://localhost:8080/api/doctors/get_doctor/${doctorId}`;

        fetch(doctorDetailsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(doctor => {
            if (doctor && doctor.room) {
                // Lưu room của bác sĩ vào localStorage
                localStorage.setItem('doctorRoom', doctor.room);
                alert(`Phòng bác sĩ đã được lưu: ${doctor.room}`);
            } else {
                alert('Không tìm thấy thông tin phòng bác sĩ.');
            }
        })
        .catch(error => {
            console.error('Có lỗi xảy ra khi lấy thông tin bác sĩ:', error);
            alert("Có lỗi khi lấy thông tin bác sĩ.");
        });

        // Đóng overlay sau khi hoàn tất
        overlay.classList.remove('show');
    })
    .catch(error => {
        console.error('Có lỗi xảy ra:', error);
        alert("Có lỗi khi cập nhật trạng thái bác sĩ.");
    });
});

// Khi nhấn vào nút "Gọi Bệnh Nhân"
document.getElementById("waiting-room-btn").addEventListener("click", function () {
    if (!doctorId) {
        alert("Vui lòng cài đặt bác sĩ trước.");
        return;
    }

    // Gọi API để lấy cuộc hẹn cho bác sĩ
    const url = `http://localhost:8080/api/appointments/get_appointment_for_doctor/${doctorId}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Sử dụng token từ localStorage
        }
    })
    .then(response => response.json())
    .then(appointment => {
        // Hiển thị overlay thông tin cuộc hẹn
        const infoOverlay = document.getElementById("info-overlay");
        const infoContent = infoOverlay.querySelector(".overlay-content");

        // Cập nhật thông tin cuộc hẹn vào overlay
        infoContent.innerHTML = `
            <h2>Thông Tin Cuộc Hẹn</h2>
            <p><strong>Chủ Pet:</strong> ${appointment.ownerName}</p>
            <p><strong>Tên Pet:</strong> ${appointment.petName}</p>
            <p><strong>Tuổi Pet:</strong> ${appointment.petAge}</p>
            <p><strong>Ngày hẹn:</strong> ${appointment.appointmentDateTime}</p>
            <p><strong>Trạng thái:</strong> ${appointment.status}</p>
            <p><strong>Ghi chú:</strong></p>
            <textarea id="doctor-note" placeholder="Nhập ghi chú bác sĩ..."></textarea>
            <button id="complete-appointment-btn">Hoàn Tất Cuộc Hẹn</button>
        `;

        // Hiển thị overlay
        infoOverlay.classList.add('show');

        // Xử lý nút hoàn tất cuộc hẹn
        const completeButton = document.getElementById("complete-appointment-btn");

        // Đảm bảo rằng sự kiện được gán sau khi nút "Hoàn Tất Cuộc Hẹn" đã được render
        completeButton.addEventListener("click", function () {
            const result = document.getElementById("doctor-note").value;

            if (!result) {
                alert("Vui lòng nhập ghi chú bác sĩ.");
                return;
            }

            // Gọi API PUT để hoàn tất cuộc hẹn
            const completeUrl = `http://localhost:8080/api/appointments/commpleted_appointment/${appointment.id}`;

            fetch(completeUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Sử dụng token từ localStorage
                },
                body: JSON.stringify({ result }) // Gửi ghi chú của bác sĩ
            })
            .then(response => response.text()) // Sử dụng .text() thay vì .json() để nhận phản hồi dưới dạng văn bản
            .then(data => {
                try {
                    // Kiểm tra xem phản hồi có phải là JSON hợp lệ không
                    const jsonData = JSON.parse(data);
                    alert("Cuộc hẹn đã được hoàn tất.");
                } catch (error) {
                    // Nếu không phải JSON, xử lý như một chuỗi văn bản
                    alert("Cuộc hẹn đã được hoàn tất: " + data);
                }

                // Cập nhật bảng hiển thị với thông tin cuộc hẹn đã hoàn tất
                const tableBody = document.getElementById("doctor-table").getElementsByTagName("tbody")[0];
                const newRow = tableBody.insertRow(); // Thêm một hàng mới vào bảng

                // Thêm các ô vào hàng mới
                newRow.insertCell(0).innerText = appointment.doctor.id; // Thêm ID bác sĩ
                newRow.insertCell(1).innerText = appointment.doctor.name;
                newRow.insertCell(2).innerText = appointment.doctor.room;
                newRow.insertCell(3).innerText = appointment.ownerName;
                newRow.insertCell(4).innerText = appointment.petName;
                newRow.insertCell(5).innerText = result; // Ghi chú của bác sĩ
                newRow.insertCell(6).innerText = 'Hoàn tất'; // Trạng thái
                const detailsButton = document.createElement('button');
                detailsButton.innerText = 'Chi Tiết';
                newRow.insertCell(7).appendChild(detailsButton); // Thêm nút chi tiết

                // Đóng overlay
                infoOverlay.classList.remove('show');
            })
            .catch(error => {
                console.error('Có lỗi xảy ra:', error);
                alert("Có lỗi khi hoàn tất cuộc hẹn.");
            });
        });

    })
    .catch(error => {
        console.error('Có lỗi xảy ra khi lấy thông tin cuộc hẹn:', error);
        alert("Có lỗi khi lấy thông tin cuộc hẹn.");
    });
});

// Hàm đóng overlay cài đặt
function closeSettingsOverlay() {
    const overlay = document.getElementById("settings-overlay");
    overlay.classList.remove('show');
}

// Hàm đóng overlay thông tin
function closeInfoOverlay() {
    const overlay = document.getElementById("info-overlay");
    overlay.classList.remove('show');
}

// Hàm kiểm tra và hiển thị thông tin bác sĩ khi trang được load lại
window.onload = function() {
    const savedRoom = localStorage.getItem('doctorRoom');
    
    if (savedRoom) {
        // Nếu có thông tin phòng bác sĩ trong localStorage, cập nhật nút "Cài đặt"
        setDoctorBtn.textContent = `Phòng: ${savedRoom}`; // Hiển thị số phòng đã lưu
        setDoctorBtn.disabled = false;  // Đặt nút là disabled
    } else {
        // Nếu không có thông tin phòng bác sĩ, đặt lại textContent là "Cài đặt"
        setDoctorBtn.textContent = "Cài đặt";
        setDoctorBtn.disabled = false;  // Đảm bảo nút không bị disabled
    }   
};

