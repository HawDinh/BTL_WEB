// Xử lý hiển thị menu dropdown cho user
document.addEventListener('DOMContentLoaded', function() {
    const userInfo = document.getElementById('user-info');
    const userMenu = document.querySelector('.user-menu');
    const usernameDisplay = document.getElementById('username-display');
    const petForm = document.getElementById('pet-form');
    const petContainer = document.getElementById('pet-container');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    console.log("Trang thú cưng được tải");
    
    // Hiện/ẩn menu user khi click
    userInfo.addEventListener('click', function(e) {
        e.preventDefault();
        userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Ẩn menu khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!userInfo.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.style.display = 'none';
    }
});

    // Lấy thông tin người dùng đang đăng nhập
    const userToken = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    console.log("Kiểm tra đăng nhập - Token:", userToken ? "Có" : "Không");
    console.log("Kiểm tra đăng nhập - Username:", username);
    
    if (userToken && username) {
        console.log("Đã đăng nhập với username:", username);
        // Kiểm tra phần tử usernameDisplay trước khi gán giá trị
        if (usernameDisplay) {
            usernameDisplay.textContent = username;
        }
    
        // Tải danh sách thú cưng
        loadPets(username);
    } else {
        console.log("Chưa đăng nhập, chuyển hướng đến trang đăng nhập");
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        window.location.href = 'Đăng nhập.html';
        return; // Dừng thực thi code ngay tại đây
}

    // Xử lý đăng xuất
    document.getElementById('logout-button').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'Đăng nhập.html';
    });
    
    // Xử lý form thêm/sửa thú cưng
    petForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const petId = document.getElementById('pet-id').value;
        const name = document.getElementById('name').value;
        const species = document.getElementById('species').value;
        const breed = document.getElementById('breed').value;
        const color = document.getElementById('color').value;
        const birthDateInput = document.getElementById('birthDate').value;
        const birthDate = birthDateInput ? birthDateInput : null;
        const gender = document.getElementById('gender').value;
        const description = document.getElementById('description').value;
        
        const petData = {
            name: name,
            species: species,
            breed: breed,
            color: color,
            birthDate: birthDate,
            gender: gender,
            description: description,
            ownerUsername: username
        };
        
        if (petId) {
            // Cập nhật thú cưng
            updatePet(petId, petData);
        } else {
            // Thêm thú cưng mới
            createPet(petData);
        }
    });
    
    // Xử lý hủy chỉnh sửa
    cancelEditBtn.addEventListener('click', function() {
        resetForm();
    });
});

// Hàm tải danh sách thú cưng của người dùng
function loadPets(username) {
    const petContainer = document.getElementById('pet-container');
    if (!petContainer) {
        console.error('Không tìm thấy phần tử pet-container');
            return;
        }
        
    petContainer.innerHTML = '<div class="loading-spinner">Đang tải thông tin thú cưng...</div>';
    
    // Encode username để tránh lỗi với ký tự đặc biệt
    const encodedUsername = encodeURIComponent(username);
    
    console.log("Đang tải dữ liệu thú cưng cho user:", username);
    
    fetch(`http://localhost:8080/api/pets/owner/${encodedUsername}`, {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        console.log("Kết quả API thú cưng - Status:", response.status);
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.log("Lỗi xác thực, chuyển hướng đến trang đăng nhập");
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = 'Đăng nhập.html';
                throw new Error('Phiên đăng nhập hết hạn');
            }
            
            // Cố gắng đọc thông tin lỗi từ response
            return response.text()
                .then(text => {
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.message || 'Không thể tải dữ liệu thú cưng: ' + response.status);
        } catch (e) {
                        throw new Error('Không thể tải dữ liệu thú cưng: ' + response.status + ' - ' + text.substring(0, 100));
                    }
                });
        }
        return response.json();
    })
    .then(pets => {
        console.log("Danh sách thú cưng:", pets.length > 0 ? pets.length + " thú cưng" : "Không có thú cưng");
        if (Array.isArray(pets)) {
            displayPets(pets);
        } else {
            console.error('Dữ liệu trả về không phải mảng:', pets);
            petContainer.innerHTML = `<div class="error-message">Dữ liệu thú cưng không hợp lệ</div>`;
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải thú cưng:', error);
        petContainer.innerHTML = `<div class="error-message">
            <p>Đã xảy ra lỗi khi tải dữ liệu thú cưng:</p>
            <p>${error.message}</p>
            <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
        </div>`;
    });
}

// Hiển thị danh sách thú cưng
function displayPets(pets) {
    const petContainer = document.getElementById('pet-container');
    
    if (pets.length === 0) {
        petContainer.innerHTML = '<div class="no-pets">Bạn chưa có thú cưng nào. Hãy thêm thú cưng mới!</div>';
        return;
    }
    
    let petsHTML = '';
    
    pets.forEach(pet => {
        // Định dạng ngày sinh 
        const birthDate = pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('vi-VN') : 'Không rõ';
        
        petsHTML += `
            <div class="pet-card" data-id="${pet.id}">
                <h3>${pet.name}</h3>
                <div class="pet-details">
                    <div class="pet-detail">
                        <strong>Loài:</strong>
                        <span>${pet.species || 'Chưa xác định'}</span>
                    </div>
                    <div class="pet-detail">
                        <strong>Giống:</strong>
                        <span>${pet.breed || 'Chưa xác định'}</span>
                    </div>
                    <div class="pet-detail">
                        <strong>Màu sắc:</strong>
                        <span>${pet.color || 'Chưa xác định'}</span>
                    </div>
                    <div class="pet-detail">
                        <strong>Ngày sinh:</strong>
                        <span>${birthDate}</span>
                    </div>
                    <div class="pet-detail">
                        <strong>Giới tính:</strong>
                        <span>${pet.gender || 'Chưa xác định'}</span>
                    </div>
                    <div class="pet-detail">
                        <strong>Mô tả:</strong>
                        <span>${pet.description || 'Không có mô tả'}</span>
        </div>
        </div>
        <div class="pet-actions">
                    <button class="edit-pet" onclick="editPet(${pet.id})">
                        <i class="fas fa-edit"></i> Sửa
            </button>
                    <button class="delete-pet" onclick="deletePet(${pet.id})">
                        <i class="fas fa-trash"></i> Xóa
            </button>
                </div>
        </div>
    `;
    });
    
    petContainer.innerHTML = petsHTML;
        }
        
// Tạo thú cưng mới
function createPet(petData) {
    fetch('http://localhost:8080/api/pets', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
            },
        body: JSON.stringify(petData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tạo thú cưng');
        }
        return response.json();
    })
    .then(pet => {
        alert('Thêm thú cưng thành công!');
        resetForm();
        loadPets(localStorage.getItem('username'));
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert(`Đã xảy ra lỗi: ${error.message}`);
    });
}

// Cập nhật thú cưng
function updatePet(id, petData) {
    fetch(`http://localhost:8080/api/pets/${id}`, {
            method: 'PUT',
            headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
            },
        body: JSON.stringify(petData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể cập nhật thú cưng');
        }
        return response.json();
    })
    .then(pet => {
        alert('Cập nhật thú cưng thành công!');
        resetForm();
        loadPets(localStorage.getItem('username'));
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert(`Đã xảy ra lỗi: ${error.message}`);
    });
}

// Xóa thú cưng
function deletePet(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa thú cưng này?')) {
        return;
}

    fetch(`http://localhost:8080/api/pets/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể xóa thú cưng');
        }
        alert('Xóa thú cưng thành công!');
        loadPets(localStorage.getItem('username'));
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert(`Đã xảy ra lỗi: ${error.message}`);
    });
}

// Chỉnh sửa thú cưng
function editPet(id) {
    fetch(`http://localhost:8080/api/pets/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tải thông tin thú cưng');
        }
        return response.json();
    })
    .then(pet => {
        // Điền thông tin vào form
        document.getElementById('pet-id').value = pet.id;
        document.getElementById('name').value = pet.name || '';
        document.getElementById('species').value = pet.species || '';
        document.getElementById('breed').value = pet.breed || '';
        document.getElementById('color').value = pet.color || '';
        
        // Xử lý ngày sinh nếu có
        if (pet.birthDate) {
            document.getElementById('birthDate').value = pet.birthDate.split('T')[0];
        } else {
            document.getElementById('birthDate').value = '';
        }
        
        document.getElementById('gender').value = pet.gender || '';
        document.getElementById('description').value = pet.description || '';
        
        // Thay đổi tiêu đề form và hiển thị nút hủy
        document.querySelector('.pet-form h2').textContent = 'Sửa Thông Tin Thú Cưng';
        document.getElementById('save-pet').textContent = 'Cập Nhật';
        document.getElementById('cancel-edit').style.display = 'block';
        
        // Cuộn đến form
        document.querySelector('.pet-form').scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert(`Đã xảy ra lỗi: ${error.message}`);
    });
}

// Reset form
function resetForm() {
    document.getElementById('pet-form').reset();
    document.getElementById('pet-id').value = '';
    document.querySelector('.pet-form h2').textContent = 'Thêm Thú Cưng Mới';
    document.getElementById('save-pet').textContent = 'Lưu Thú Cưng';
    document.getElementById('cancel-edit').style.display = 'none';
}