document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập và phân quyền
    checkAdminAccess();

    // Thiết lập sự kiện
    setupEventListeners();

    // Khởi tạo tab mặc định
    document.querySelector('.tab-pane.active').style.display = 'block';

    const searchInput = document.getElementById('admin-search-input');
    const searchBtn = document.getElementById('admin-search-btn');
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', handleAdminSearch);
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') handleAdminSearch();
        });
    }
});

// Kiểm tra quyền admin và token
function checkAdminAccess() {
    document.getElementById('admin-name').textContent = 'Admin';
    loadDashboardData();
}

// Hàm phân tích JWT token để lấy thông tin payload
function parseJwt(token) {
    try {
        // Lấy phần payload của token (phần thứ 2 sau khi tách theo dấu chấm)
        const base64Url = token.split('.')[1];
        // Chuyển base64url sang base64 chuẩn
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Giải mã và chuyển thành chuỗi UTF-8
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        // Chuyển chuỗi JSON thành đối tượng JavaScript
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Lỗi khi phân tích JWT:", e);
        return null;
    }
}

// Chuyển hướng đến trang đăng nhập
function redirectToLogin() {
    localStorage.removeItem('token');
    window.location.href = 'Đăng nhập.html';
}

// Thiết lập các sự kiện
function setupEventListeners() {
    // Sự kiện đăng xuất
    document.getElementById('logout-button').addEventListener('click', function(e) {
        e.preventDefault();
        logOut();
    });

    // Sự kiện chuyển tab
    const tabItems = document.querySelectorAll('#sidebar nav li[data-tab]');
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId, this);
        });
    });

    // Sự kiện thêm mới
    document.getElementById('add-pet').addEventListener('click', () => openPetModal());
    document.getElementById('add-service').addEventListener('click', () => openServiceModal());
    document.getElementById('add-article').addEventListener('click', () => openArticleModal());
    document.getElementById('add-user').addEventListener('click', () => openUserModal());
    document.getElementById('add-appointment').addEventListener('click', () => openAppointmentModal());

    // Sự kiện đóng modal
    document.querySelectorAll('.close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Sự kiện submit form
    document.getElementById('pet-form').addEventListener('submit', handlePetSubmit);
    document.getElementById('service-form').addEventListener('submit', handleServiceSubmit);
    document.getElementById('article-form').addEventListener('submit', handleArticleSubmit);
    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
    document.getElementById('appointment-form').addEventListener('submit', handleAppointmentSubmit);

    // Sự kiện xác nhận xóa
    document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
    document.getElementById('cancel-delete').addEventListener('click', () => {
        document.getElementById('delete-modal').style.display = 'none';
    });

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Bộ lọc cho lịch hẹn
    document.getElementById('appointment-status-filter').addEventListener('change', loadAppointments);
    document.getElementById('appointment-date-filter').addEventListener('change', loadAppointments);
    document.getElementById('clear-date-filter').addEventListener('click', function() {
        document.getElementById('appointment-date-filter').value = '';
        loadAppointments();
    });
}

// Hàm đăng xuất
function logOut() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('http://localhost:8080/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .finally(() => {
            localStorage.removeItem('token');
            window.location.href = 'Đăng nhập.html';
        });
    } else {
        window.location.href = 'Đăng nhập.html';
    }
}

// Chuyển đổi tab
function switchTab(tabId, tabElement) {
    // Cập nhật trạng thái active cho tab menu
    document.querySelectorAll('#sidebar nav li').forEach(li => {
        li.classList.remove('active');
    });
    tabElement.classList.add('active');

    // Ẩn tất cả tab-pane và xóa class active
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
        pane.classList.remove('active');
    });

    // Hiển thị tab được chọn và gán class active
    const currentTab = document.getElementById(tabId);
    currentTab.style.display = 'block';
    currentTab.classList.add('active');

    // Tải dữ liệu tương ứng với tab
    switch (tabId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'pets':
            loadPets();
            break;
        case 'services':
            loadServices();
            break;
        case 'articles':
            loadArticles();
            break;
        case 'users':
            loadUsers();
            break;
        case 'appointments':
            loadAppointments();
            break;
    }
}

// Tải dữ liệu tổng quan
function loadDashboardData() {
    const token = localStorage.getItem('token');
    
    // Tải số lượng thú cưng
    fetch('http://localhost:8080/api/count/pets', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-pets').textContent = (typeof data === 'object' && data.result !== undefined) ? data.result : data;
    })
    .catch(error => console.error('Lỗi khi tải số lượng thú cưng:', error));

    // Tải số lượng dịch vụ
    fetch('http://localhost:8080/api/count/services', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-services').textContent = (typeof data === 'object' && data.result !== undefined) ? data.result : data;
    })
    .catch(error => console.error('Lỗi khi tải số lượng dịch vụ:', error));

    // Tải số lượng bài viết
    fetch('http://localhost:8080/api/count/articles', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-articles').textContent = (typeof data === 'object' && data.result !== undefined) ? data.result : data;
    })
    .catch(error => console.error('Lỗi khi tải số lượng bài viết:', error));

    // Tải số lượng người dùng
    fetch('http://localhost:8080/api/count/users', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-users').textContent = (typeof data === 'object' && data.result !== undefined) ? data.result : data;
    })
    .catch(error => console.error('Lỗi khi tải số lượng người dùng:', error));

    // Tải số lượng lịch hẹn
    fetch('http://localhost:8080/api/appointments/get_all_appointment', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(appointments => {
        // Thêm card hiển thị số lượng lịch hẹn
        const statsContainer = document.querySelector('.stats-container');
        
        // Kiểm tra nếu card lịch hẹn chưa tồn tại
        if (!document.querySelector('.stat-card.appointments')) {
            const appointmentCard = document.createElement('div');
            appointmentCard.className = 'stat-card appointments';
            appointmentCard.innerHTML = `
                <div class="stat-icon appointments">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-info">
                    <h3>Lịch Hẹn</h3>
                    <p id="total-appointments">${appointments.length}</p>
                </div>
            `;
            statsContainer.appendChild(appointmentCard);
        } else {
            document.getElementById('total-appointments').textContent = appointments.length;
        }
    })
    .catch(error => console.error('Lỗi khi tải số lượng lịch hẹn:', error));
}

// ------- QUẢN LÝ THÚ CƯNG -------

// Tải danh sách thú cưng
function loadPets() {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/pets', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tải danh sách thú cưng');
        }
        return response.json();
    })
    .then(pets => {
        const tableBody = document.getElementById('pets-table-body');
        tableBody.innerHTML = '';

        if (!Array.isArray(pets) || pets.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">Không có dữ liệu</td>';
            tableBody.appendChild(emptyRow);
            return;
        }

        pets.forEach(pet => {
            const petId = (pet.petId !== undefined && pet.petId !== null && pet.petId !== '') ? pet.petId : ((pet.id !== undefined && pet.id !== null && pet.id !== '') ? pet.id : '');
            const ownerName = pet.ownerUsername || '';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${petId}</td>
                <td>${pet.name}</td>
                <td>${pet.species}</td>
                <td>${pet.breed}</td>
                <td>${pet.gender === 'Male' ? 'Đực' : 'Cái'}</td>
                <td>${ownerName || 'N/A'}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${petId}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${petId}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('#pets-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id || id === 'undefined' || id === '') {
                    alert('Không tìm thấy ID thú cưng để sửa!');
                    return;
                }
                editPet(id);
            });
        });

        document.querySelectorAll('#pets-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal('pet', btn.getAttribute('data-id')));
        });
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể tải dữ liệu thú cưng. Vui lòng thử lại sau.');
    });

    // Tải danh sách chủ sở hữu cho dropdown
    loadPetOwners();
}

// Tải danh sách chủ sở hữu
function loadPetOwners() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8080/api/users', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(users => {
        const ownerSelect = document.getElementById('pet-owner');
        ownerSelect.innerHTML = '<option value="">Chọn chủ sở hữu</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            ownerSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Lỗi khi tải danh sách chủ sở hữu:', error));
}

// Mở modal thêm thú cưng
function openPetModal(petId = null) {
    const modal = document.getElementById('pet-modal');
    const modalTitle = document.getElementById('pet-modal-title');
    const form = document.getElementById('pet-form');
    form.reset();
    if (petId) {
        modalTitle.textContent = 'Chỉnh Sửa Thú Cưng';
        loadPetDetails(petId);
    } else {
        modalTitle.textContent = 'Thêm Thú Cưng';
        document.getElementById('pet-id').value = '';
    }
    modal.style.display = 'block';
}

// Tải chi tiết thú cưng để chỉnh sửa
function loadPetDetails(petId) {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8080/api/pets/${petId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(pet => {
        document.getElementById('pet-id').value = (pet.id !== undefined && pet.id !== null && pet.id !== '') ? pet.id : (pet.petId !== undefined ? pet.petId : '');
        document.getElementById('pet-name').value = pet.name;
        document.getElementById('pet-species').value = pet.species;
        document.getElementById('pet-breed').value = pet.breed;
        document.getElementById('pet-gender').value = pet.gender;
        document.getElementById('pet-owner').value = pet.owner ? pet.owner.id : '';
        document.getElementById('pet-birthday').value = pet.birthDate ? pet.birthDate.split('T')[0] : '';
        document.getElementById('pet-description').value = pet.description || '';
    })
    .catch(error => console.error('Lỗi khi tải chi tiết thú cưng:', error));
}

// Xử lý submit form thú cưng
function handlePetSubmit(e) {
    e.preventDefault();
    const petId = document.getElementById('pet-id').value;
    const isEdit = petId !== '' && petId !== undefined && petId !== 'undefined';
    const petData = {
        name: document.getElementById('pet-name').value,
        species: document.getElementById('pet-species').value,
        breed: document.getElementById('pet-breed').value,
        gender: document.getElementById('pet-gender').value,
        ownerUsername: document.getElementById('pet-owner').value,
        birthDate: document.getElementById('pet-birthday').value,
        description: document.getElementById('pet-description').value
    };
    if (isEdit) {
        updatePet(petId, petData);
    } else {
        createPet(petData);
    }
}

// Tạo thú cưng mới
function createPet(petData) {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8080/api/pets', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
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
    .then(() => {
        closeAllModals();
        loadPets();
        alert('Thêm thú cưng thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể thêm thú cưng. Vui lòng thử lại.');
    });
}

// Cập nhật thú cưng
function updatePet(petId, petData) {
    if (!petId || petId === 'undefined' || petId === '') {
        alert('ID thú cưng không hợp lệ!');
        return;
    }
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
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
    .then(() => {
        closeAllModals();
        loadPets();
        alert('Cập nhật thú cưng thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể cập nhật thú cưng. Vui lòng thử lại.');
    });
}

// ------- QUẢN LÝ DỊCH VỤ -------

// Tải danh sách dịch vụ
function loadServices() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8080/api/services', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tải danh sách dịch vụ');
        }
        return response.json();
    })
    .then(services => {
        const tableBody = document.getElementById('services-table-body');
        tableBody.innerHTML = '';

        if (services.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="text-center">Không có dữ liệu</td>';
            tableBody.appendChild(emptyRow);
            return;
        }

        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>${service.description}</td>
                <td>${formatCurrency(service.price)}</td>
                <td>${service.duration} phút</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${service.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${service.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Thêm sự kiện cho các nút
        document.querySelectorAll('#services-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editService(btn.getAttribute('data-id')));
        });

        document.querySelectorAll('#services-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal('service', btn.getAttribute('data-id')));
        });
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.');
    });
}

// Mở modal thêm dịch vụ
function openServiceModal(serviceId = null) {
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('service-modal-title');
    const form = document.getElementById('service-form');
    
    // Reset form
    form.reset();
    document.getElementById('service-id').value = '';
    
    if (serviceId) {
        modalTitle.textContent = 'Chỉnh Sửa Dịch Vụ';
        loadServiceDetails(serviceId);
    } else {
        modalTitle.textContent = 'Thêm Dịch Vụ';
    }
    
    modal.style.display = 'block';
}

// Tải chi tiết dịch vụ để chỉnh sửa
function loadServiceDetails(serviceId) {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8080/api/services/${serviceId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(service => {
        document.getElementById('service-id').value = service.id;
        document.getElementById('service-name').value = service.name;
        document.getElementById('service-description').value = service.description;
        document.getElementById('service-price').value = service.price;
        document.getElementById('service-duration').value = service.duration;
    })
    .catch(error => console.error('Lỗi khi tải chi tiết dịch vụ:', error));
}

// Xử lý submit form dịch vụ
function handleServiceSubmit(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('service-id').value;
    const isEdit = serviceId !== '';
    
    const serviceData = {
        name: document.getElementById('service-name').value,
        description: document.getElementById('service-description').value,
        price: parseFloat(document.getElementById('service-price').value),
        duration: parseInt(document.getElementById('service-duration').value)
    };
    
    if (isEdit) {
        updateService(serviceId, serviceData);
    } else {
        createService(serviceData);
    }
}

// Tạo dịch vụ mới
function createService(serviceData) {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8080/api/services', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tạo dịch vụ');
        }
        return response.json();
    })
    .then(() => {
        closeAllModals();
        loadServices();
        alert('Thêm dịch vụ thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể thêm dịch vụ. Vui lòng thử lại.');
    });
}

// Cập nhật dịch vụ
function updateService(serviceId, serviceData) {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8080/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể cập nhật dịch vụ');
        }
        return response.json();
    })
    .then(() => {
        closeAllModals();
        loadServices();
        alert('Cập nhật dịch vụ thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể cập nhật dịch vụ. Vui lòng thử lại.');
    });
}

// ------- QUẢN LÝ BÀI VIẾT -------

// Tải danh sách bài viết
function loadArticles() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8080/api/articles/get_all_article', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tải danh sách bài viết');
        }
        return response.json();
    })
    .then(articles => {
        const tableBody = document.getElementById('articles-table-body');
        tableBody.innerHTML = '';

        if (articles.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="text-center">Không có dữ liệu</td>';
            tableBody.appendChild(emptyRow);
            return;
        }

        articles.forEach(article => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${article.id}</td>
                <td>${article.title !== undefined && article.title !== null ? article.title : ''}</td>
                <td>${article.author !== undefined && article.author !== null ? article.author : 'Admin'}</td>
                <td>${formatDate(article.createdAt)}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${article.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${article.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Thêm sự kiện cho các nút
        document.querySelectorAll('#articles-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editArticle(btn.getAttribute('data-id')));
        });

        document.querySelectorAll('#articles-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal('article', btn.getAttribute('data-id')));
        });
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.');
    });
}

// Mở modal thêm bài viết
function openArticleModal(articleId = null) {
    const modal = document.getElementById('article-modal');
    const modalTitle = document.getElementById('article-modal-title');
    const form = document.getElementById('article-form');
    
    // Reset form
    form.reset();
    document.getElementById('article-id').value = '';
    
    if (articleId) {
        modalTitle.textContent = 'Chỉnh Sửa Bài Viết';
        loadArticleDetails(articleId);
    } else {
        modalTitle.textContent = 'Thêm Bài Viết';
    }
    
    modal.style.display = 'block';
}

// Tải chi tiết bài viết để chỉnh sửa
function loadArticleDetails(articleId) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/articles/get_article_by_id/${articleId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(article => {
        document.getElementById('article-id').value = article.id !== undefined && article.id !== null ? article.id : '';
        document.getElementById('article-title').value = article.title !== undefined && article.title !== null ? article.title : '';
        document.getElementById('article-image').value = article.imageUrl !== undefined && article.imageUrl !== null ? article.imageUrl : '';
        document.getElementById('article-content').value = article.content !== undefined && article.content !== null ? article.content : '';
    })
    .catch(error => console.error('Lỗi khi tải chi tiết bài viết:', error));
}

// Xử lý submit form bài viết
function handleArticleSubmit(e) {
    e.preventDefault();
    const articleId = document.getElementById('article-id').value;
    const isEdit = articleId !== '';
    // Lấy author từ bảng (nếu có) hoặc mặc định là 'Admin'
    let author = 'Admin';
    // Nếu đang sửa, lấy author từ dòng đang sửa (nếu có)
    if (isEdit) {
        // Tìm dòng đang sửa trong bảng
        const row = Array.from(document.querySelectorAll('#articles-table-body tr')).find(tr => {
            const idCell = tr.querySelector('td');
            return idCell && idCell.textContent.trim() == articleId;
        });
        if (row) {
            const authorCell = row.querySelectorAll('td')[2];
            if (authorCell && authorCell.textContent.trim() !== '') {
                author = authorCell.textContent.trim();
            }
        }
    }
    const articleData = {
        title: document.getElementById('article-title').value,
        imageUrl: document.getElementById('article-image').value,
        content: document.getElementById('article-content').value,
        author: author
    };
    if (isEdit) {
        updateArticle(articleId, articleData);
    } else {
        createArticle(articleData);
    }
}

// Tạo bài viết mới
function createArticle(articleData) {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8080/articles', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tạo bài viết');
        }
        return response.json();
    })
    .then(() => {
        closeAllModals();
        loadArticles();
        alert('Thêm bài viết thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể thêm bài viết. Vui lòng thử lại.');
    });
}

// Cập nhật bài viết
function updateArticle(articleId, articleData) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/articles/update_article/${articleId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể cập nhật bài viết');
        }
        return response.json();
    })
    .then(() => {
        closeAllModals();
        loadArticles();
        alert('Cập nhật bài viết thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể cập nhật bài viết. Vui lòng thử lại.');
    });
}

// ------- QUẢN LÝ NGƯỜI DÙNG -------

// Tải danh sách người dùng
function loadUsers() {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/users', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(users => {
        if (typeof users === 'object' && users.result !== undefined) {
            users = users.result;
        }
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '';
        if (!Array.isArray(users) || users.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="9" class="text-center">Không có dữ liệu</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.username || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.fullName || user.firstName || ''}</td>
                <td>${user.dateOfBirth ? (user.dateOfBirth.split('T')[0]) : ''}</td>
                <td>${user.phoneNumber || ''}</td>
                <td>${user.address || ''}</td>
                <td>${user.gender || ''}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${user.id || user.userId}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${user.id || user.userId}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        document.querySelectorAll('#users-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openUserModal(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('#users-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal('user', btn.getAttribute('data-id')));
        });
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.');
    });
}

// Mở modal thêm/sửa người dùng
function openUserModal(userId = null) {
    const modal = document.getElementById('user-modal');
    const modalTitle = document.getElementById('user-modal-title');
    const form = document.getElementById('user-form');
    form.reset();
    document.getElementById('user-id').value = '';
    if (userId) {
        modalTitle.textContent = 'Chỉnh Sửa Người Dùng';
        loadUserDetails(userId);
    } else {
        modalTitle.textContent = 'Thêm Người Dùng';
    }
    modal.style.display = 'block';
}

// Tải chi tiết người dùng để chỉnh sửa
function loadUserDetails(userId) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(user => {
        // Nếu backend trả về user.result thì lấy từ user.result
        if (user && user.result) {
            user = user.result;
        }
        document.getElementById('user-id').value = user.id || user.userId || '';
        document.getElementById('user-username').value = user.username || '';
        document.getElementById('user-email').value = user.email || '';
        document.getElementById('user-fullname').value = user.fullName || user.firstName || '';
        document.getElementById('user-dob').value = user.dateOfBirth ? (typeof user.dateOfBirth === 'string' && user.dateOfBirth.includes('T') ? user.dateOfBirth.split('T')[0] : user.dateOfBirth) : '';
        document.getElementById('user-phone').value = user.phoneNumber || '';
        document.getElementById('user-address').value = user.address || '';
        document.getElementById('user-gender').value = user.gender || '';
    })
    .catch(error => console.error('Lỗi khi tải chi tiết người dùng:', error));
}

// Xử lý submit form người dùng
function handleUserSubmit(e) {
    e.preventDefault();
    const userId = document.getElementById('user-id').value;
    const isEdit = userId !== '';
    const userData = {
        username: document.getElementById('user-username').value,
        email: document.getElementById('user-email').value,
        firstName: document.getElementById('user-fullname').value,
        dateOfBirth: document.getElementById('user-dob').value,
        phoneNumber: document.getElementById('user-phone').value,
        address: document.getElementById('user-address').value,
        gender: document.getElementById('user-gender').value
    };
    // Luôn truyền password khi update
    if (isEdit) {
        userData.password = '123456'; // hoặc lấy từ input nếu có
        userData.username = document.getElementById('user-username').value;
        updateUser(userId, userData);
    } else {
        userData.password = '123456';
        createUser(userData);
    }
}

// Tạo người dùng mới
function createUser(userData) {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Không thể tạo người dùng');
        return response.json();
    })
    .then(() => {
        closeAllModals();
        loadUsers();
        alert('Thêm người dùng thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể thêm người dùng. Vui lòng thử lại.');
    });
}

// Cập nhật người dùng
function updateUser(userId, userData) {
    const token = localStorage.getItem('token');
    // Luôn truyền password khi cập nhật, nếu không có thì đặt mặc định
    if (!userData.password || userData.password === '') {
        userData.password = '123456';
    }
    fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Không thể cập nhật người dùng');
        return response.json();
    })
    .then(() => {
        closeAllModals();
        loadUsers();
        alert('Cập nhật người dùng thành công!');
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể cập nhật người dùng. Vui lòng thử lại.');
    });
}

// ------- CHỨC NĂNG XÓA -------

// Mở modal xác nhận xóa
function openDeleteModal(type, id) {
    document.getElementById('delete-modal').setAttribute('data-type', type);
    document.getElementById('delete-modal').setAttribute('data-id', id);
    document.getElementById('delete-modal').style.display = 'block';

    // Đổi nội dung thông báo tùy theo loại
    const confirmMessage = document.querySelector('#delete-modal p');
    if (type === 'appointment') {
        confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa lịch hẹn này?';
        document.getElementById('confirm-delete').textContent = 'Xóa lịch';
    } else {
        confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa mục này?';
        document.getElementById('confirm-delete').textContent = 'Xóa';
    }
}

function confirmDelete() {
    const deleteType = document.getElementById('delete-modal').getAttribute('data-type');
    const deleteId = document.getElementById('delete-modal').getAttribute('data-id');
    
    if (!deleteType || !deleteId) {
        alert('Thiếu thông tin để xóa');
        return;
    }
    
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    let apiUrl;
    let method = 'DELETE';
    
    switch(deleteType) {
        case 'pet':
            apiUrl = `http://localhost:8080/api/pets/${deleteId}`;
            break;
        case 'service':
            apiUrl = `http://localhost:8080/api/services/${deleteId}`;
            break;
        case 'article':
            apiUrl = `http://localhost:8080/api/articles/${deleteId}`;
            break;
        case 'user':
            apiUrl = `http://localhost:8080/api/users/${deleteId}`;
            break;
        case 'appointment':
            // Sử dụng API xóa hoàn toàn thay vì hủy lịch
            apiUrl = `http://localhost:8080/api/appointments/${deleteId}`;
            method = 'DELETE';
            break;
        default:
            return;
    }
    
    fetch(apiUrl, {
        method: method,
        headers: headers
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Không thể xóa mục này (mã lỗi: ${response.status})`);
        }
        return response.text();
    })
    .then(() => {
        document.getElementById('delete-modal').style.display = 'none';
        
        // Tải lại dữ liệu tương ứng
        switch(deleteType) {
            case 'pet':
                loadPets();
                break;
            case 'service':
                loadServices();
                break;
            case 'article':
                loadArticles();
                break;
            case 'user':
                loadUsers();
                break;
            case 'appointment':
                loadAppointments();
                break;
        }
        
        alert(`Xóa thành công!`);
    })
    .catch(error => {
        console.error('Lỗi khi xóa:', error);
        alert(`Lỗi khi xóa: ${error.message}`);
    });
}

// ------- TIỆN ÍCH -------

// Đóng tất cả modal
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Lấy tên danh mục
function getCategoryName(category) {
    const categories = {
        'health': 'Sức Khỏe',
        'training': 'Huấn Luyện',
        'nutrition': 'Dinh Dưỡng',
        'grooming': 'Làm Đẹp'
    };
    
    return categories[category] || category;
}

// --- Tìm kiếm ---
function handleAdminSearch() {
    const keyword = document.getElementById('admin-search-input').value.trim();
    const activeTab = document.querySelector('.tab-pane.active').id;
    alert('Tab hiện tại: ' + activeTab); // DEBUG: Xem id tab thực sự đang active
    if (!['pets', 'services', 'articles'].includes(activeTab)) {
        alert('Chức năng tìm kiếm chỉ áp dụng cho Thú cưng, Dịch vụ, Bài viết!');
        return;
    }
    if (!keyword) {
        // Nếu không nhập từ khóa, load lại toàn bộ
        switch (activeTab) {
            case 'pets': loadPets(); break;
            case 'services': loadServices(); break;
            case 'articles': loadArticles(); break;
        }
        return;
    }
    switch (activeTab) {
        case 'pets':
            searchPets(keyword);
            break;
        case 'services':
            searchServices(keyword);
            break;
        case 'articles':
            searchArticles(keyword);
            break;
    }
}

function searchPets(keyword) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/pets/search?keyword=${encodeURIComponent(keyword)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(pets => {
        const tableBody = document.getElementById('pets-table-body');
        tableBody.innerHTML = '';
        if (!Array.isArray(pets) || pets.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">Không có dữ liệu</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        pets.forEach(pet => {
            const petId = (pet.petId !== undefined && pet.petId !== null && pet.petId !== '') ? pet.petId : ((pet.id !== undefined && pet.id !== null && pet.id !== '') ? pet.id : '');
            const ownerName = pet.ownerUsername || '';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${petId}</td>
                <td>${pet.name}</td>
                <td>${pet.species}</td>
                <td>${pet.breed}</td>
                <td>${pet.gender === 'Male' ? 'Đực' : 'Cái'}</td>
                <td>${ownerName || 'N/A'}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${petId}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${petId}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        document.querySelectorAll('#pets-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (!id || id === 'undefined' || id === '') {
                    alert('Không tìm thấy ID thú cưng để sửa!');
                    return;
                }
                editPet(id);
            });
        });
        document.querySelectorAll('#pets-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal('pet', btn.getAttribute('data-id')));
        });
    })
    .catch(error => {
        console.error('Lỗi tìm kiếm thú cưng:', error);
        alert('Không thể tìm kiếm thú cưng.');
    });
}

function searchServices(keyword) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/services/search?name=${encodeURIComponent(keyword)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(services => {
        const tableBody = document.getElementById('services-table-body');
        tableBody.innerHTML = '';
        if (!Array.isArray(services) || services.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="text-center">Không có dữ liệu</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>${service.description}</td>
                <td>${formatCurrency(service.price)}</td>
                <td>${service.duration} phút</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${service.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${service.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        document.querySelectorAll('#services-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editService(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('#services-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal('service', btn.getAttribute('data-id')));
        });
    })
    .catch(error => {
        console.error('Lỗi tìm kiếm dịch vụ:', error);
        alert('Không thể tìm kiếm dịch vụ.');
    });
}

function searchArticles(keyword) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/articles/get_article_by_title/${encodeURIComponent(keyword)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(articles => {
        const tableBody = document.getElementById('articles-table-body');
        tableBody.innerHTML = '';
        if (!Array.isArray(articles) || articles.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="text-center">Không có dữ liệu</td>';
            tableBody.appendChild(emptyRow);
            return;
        }
        articles.forEach(article => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${article.id}</td>
                <td>${article.title !== undefined && article.title !== null ? article.title : ''}</td>
                <td>${article.author !== undefined && article.author !== null ? article.author : 'Admin'}</td>
                <td>${formatDate(article.createdAt)}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${article.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${article.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        document.querySelectorAll('#articles-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editArticle(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('#articles-table-body .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal('article', btn.getAttribute('data-id')));
        });
    })
    .catch(error => {
        console.error('Lỗi tìm kiếm bài viết:', error);
        alert('Không thể tìm kiếm bài viết.');
    });
}

function editPet(petId) {
    openPetModal(petId);
}

function editService(serviceId) {
    openServiceModal(serviceId);
}

function editArticle(articleId) {
    openArticleModal(articleId);
}

// Tải danh sách lịch hẹn
function loadAppointments() {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Lấy giá trị bộ lọc
    const statusFilter = document.getElementById('appointment-status-filter').value;
    const dateFilter = document.getElementById('appointment-date-filter').value;
    
    document.getElementById('appointments-table-body').innerHTML = '<tr><td colspan="8" class="text-center">Đang tải dữ liệu...</td></tr>';

    fetch('http://localhost:8080/api/appointments/get_all_appointment', { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải danh sách lịch hẹn');
            }
            return response.json();
        })
        .then(appointments => {
            console.log('Dữ liệu lịch hẹn từ server:', appointments);
            
            // Kiểm tra nếu có lịch hẹn thiếu thông tin pet
            const needUpdate = appointments.some(appointment => 
                appointment.pet === null && appointment.ownerName !== null);
            
            if (needUpdate) {
                // Gọi API để cập nhật liên kết pet
                console.log('Phát hiện lịch hẹn thiếu thông tin pet, đang cập nhật...');
                updatePetReferences();
            }
            
            // Lọc theo trạng thái
            if (statusFilter) {
                appointments = appointments.filter(appointment => appointment.status === statusFilter);
            }
            
            // Lọc theo ngày
            if (dateFilter) {
                const filterDate = new Date(dateFilter).toISOString().split('T')[0];
                appointments = appointments.filter(appointment => {
                    if (!appointment.appointmentDateTime) return false;
                    const appointmentDate = new Date(appointment.appointmentDateTime).toISOString().split('T')[0];
                    return appointmentDate === filterDate;
                });
            }
            
            // Sắp xếp theo thời gian (mới nhất lên đầu)
            appointments.sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime));
            
            // Hiển thị dữ liệu
            displayAppointments(appointments);
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách lịch hẹn:', error);
            document.getElementById('appointments-table-body').innerHTML = `
                <tr>
                    <td colspan="8" class="text-center error-message">
                        <i class="fas fa-exclamation-triangle"></i> Không thể tải danh sách lịch hẹn: ${error.message}
                    </td>
                </tr>
            `;
        });
}

// Cập nhật liên kết pet cho lịch hẹn
function updatePetReferences() {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    
    fetch('http://localhost:8080/api/appointments/update-pet-references', { 
        method: 'GET',
        headers: headers 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể cập nhật liên kết pet');
        }
        return response.text();
    })
    .then(data => {
        console.log('Cập nhật liên kết pet thành công:', data);
        // Tải lại danh sách lịch hẹn sau khi cập nhật
        setTimeout(() => loadAppointments(), 1000);
    })
    .catch(error => {
        console.error('Lỗi khi cập nhật liên kết pet:', error);
    });
}

// Hiển thị danh sách lịch hẹn
function displayAppointments(appointments) {
    const tableBody = document.getElementById('appointments-table-body');
    tableBody.innerHTML = '';

    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Không có lịch hẹn nào</td></tr>';
        return;
    }

    appointments.forEach(appointment => {
        // Định dạng ngày giờ
        const appointmentDate = new Date(appointment.appointmentDateTime);
        const formattedDate = appointmentDate.toLocaleDateString('vi-VN');
        const formattedTime = appointmentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        // Lấy thông tin khách hàng
        const ownerName = appointment.ownerName || 'Không có thông tin';
        
        // Lấy thông tin thú cưng
        let petName = 'Không có thông tin';
        if (appointment.pet && appointment.pet.name) {
            petName = appointment.pet.name;
        } else if (appointment.petName) {
            petName = appointment.petName;
        }
        
        // Lấy thông tin bác sĩ
        let doctorName = 'Chưa chỉ định';
        if (appointment.doctor && appointment.doctor.name) {
            doctorName = appointment.doctor.name;
        }
        
        // Tạo trạng thái
        const statusClass = `status-${appointment.status.replace(/\s+/g, '-')}`;
        const statusText = getStatusText(appointment.status);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>${ownerName}</td>
            <td>${petName}</td>
            <td>${formattedDate}</td>
            <td>${formattedTime}</td>
            <td>${doctorName}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editAppointment(${appointment.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="openDeleteModal('appointment', ${appointment.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
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

// Tải thông tin chi tiết lịch hẹn
function loadAppointmentDetails(appointmentId) {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    fetch(`http://localhost:8080/api/appointments/get_appointment_by_id/${appointmentId}`, { headers })
        .then(response => response.json())
        .then(appointment => {
            // Đặt giá trị cho form
            document.getElementById('appointment-id').value = appointment.id;
            
            // Đặt giá trị ngày giờ
            if (appointment.appointmentDateTime) {
                const dateTime = new Date(appointment.appointmentDateTime);
                // Format datetime-local input (YYYY-MM-DDTHH:mm)
                document.getElementById('appointment-datetime').value = dateTime.toISOString().slice(0, 16);
            }
            
            // Đặt giá trị trạng thái
            document.getElementById('appointment-status').value = appointment.status;
            
            // Đặt giá trị ghi chú
            document.getElementById('appointment-notes').value = appointment.notes || '';
            
            // Đặt giá trị chủ sở hữu (giờ là input text)
            document.getElementById('appointment-owner').value = appointment.ownerName || '';
            
            // Tải danh sách thú cưng của chủ sở hữu nếu có ownerName
            if (appointment.ownerName) {
                loadUserPets(appointment.ownerName);
            }
            
            // Đặt giá trị thú cưng (đợi loadUserPets hoàn thành)
            setTimeout(() => {
                if (appointment.pet && appointment.pet.id) {
                    document.getElementById('appointment-pet').value = appointment.pet.id;
                }
            }, 500);
            
            // Đặt giá trị bác sĩ
            if (appointment.doctor && appointment.doctor.id) {
                document.getElementById('appointment-doctor').value = appointment.doctor.id;
            }
            
            // Đặt giá trị bác sĩ ưu tiên
            if (appointment.preferredDoctor && appointment.preferredDoctor.id) {
                document.getElementById('appointment-preferred-doctor').value = appointment.preferredDoctor.id;
            }
        })
        .catch(error => console.error('Lỗi khi tải thông tin lịch hẹn:', error));
}

// Mở modal lịch hẹn
function openAppointmentModal(appointmentId = null) {
    document.getElementById('appointment-modal-title').textContent = appointmentId ? 'Sửa Lịch Hẹn' : 'Thêm Lịch Hẹn';
    document.getElementById('appointment-form').reset();
    document.getElementById('appointment-id').value = appointmentId || '';
    
    // Thêm sự kiện cho input owner khi thay đổi để tải danh sách thú cưng
    const ownerInput = document.getElementById('appointment-owner');
    ownerInput.addEventListener('change', function() {
        if (this.value.trim() !== '') {
            loadUserPets(this.value.trim());
        } else {
            document.getElementById('appointment-pet').innerHTML = '<option value="">Chọn thú cưng</option>';
        }
    });
    
    // Tải danh sách bác sĩ
    loadDoctors();
    
    // Nếu là sửa, tải thông tin lịch hẹn
    if (appointmentId) {
        loadAppointmentDetails(appointmentId);
    }
    
    document.getElementById('appointment-modal').style.display = 'block';
}

// Tải danh sách thú cưng của khách hàng
function loadUserPets(username) {
    if (!username) {
        document.getElementById('appointment-pet').innerHTML = '<option value="">Chọn thú cưng</option>';
        return;
    }
    
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Đầu tiên thử tìm pets theo username
    fetch(`http://localhost:8080/api/pets/owner/${username}`, { headers })
        .then(response => {
            if (!response.ok) {
                // Nếu không tìm thấy, có thể username là tên hiển thị chứ không phải username thực
                // Chuẩn bị trả về danh sách rỗng
                return [];
            }
            return response.json();
        })
        .then(pets => {
            const petSelect = document.getElementById('appointment-pet');
            petSelect.innerHTML = '<option value="">Chọn thú cưng</option>';
            
            if (pets && pets.length > 0) {
                pets.forEach(pet => {
                    const option = document.createElement('option');
                    option.value = pet.id;
                    option.textContent = pet.name;
                    petSelect.appendChild(option);
                });
            } else {
                // Nếu không tìm thấy thú cưng, thêm tùy chọn để tạo mới
                const option = document.createElement('option');
                option.value = "new";
                option.textContent = "Tạo thú cưng mới";
                petSelect.appendChild(option);
                
                // Thêm sự kiện khi chọn tạo mới
                petSelect.addEventListener('change', function() {
                    if (this.value === "new") {
                        const petName = prompt("Nhập tên thú cưng:");
                        if (petName) {
                            const newOption = document.createElement('option');
                            newOption.value = "new_" + petName;
                            newOption.textContent = petName + " (Sẽ được tạo mới)";
                            newOption.selected = true;
                            petSelect.appendChild(newOption);
                        } else {
                            this.value = "";
                        }
                    }
                });
            }
        })
        .catch(error => console.error('Lỗi khi tải danh sách thú cưng:', error));
}

// Tải danh sách bác sĩ
function loadDoctors() {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    fetch('http://localhost:8080/api/doctors', { headers })
        .then(response => response.json())
        .then(doctors => {
            const doctorSelect = document.getElementById('appointment-doctor');
            const preferredDoctorSelect = document.getElementById('appointment-preferred-doctor');
            
            doctorSelect.innerHTML = '<option value="">Chưa chỉ định</option>';
            preferredDoctorSelect.innerHTML = '<option value="">Không có</option>';
            
            doctors.forEach(doctor => {
                const doctorOption = document.createElement('option');
                doctorOption.value = doctor.id;
                doctorOption.textContent = doctor.name;
                doctorSelect.appendChild(doctorOption);
                
                const preferredOption = document.createElement('option');
                preferredOption.value = doctor.id;
                preferredOption.textContent = doctor.name;
                preferredDoctorSelect.appendChild(preferredOption);
            });
        })
        .catch(error => console.error('Lỗi khi tải danh sách bác sĩ:', error));
}

// Xử lý submit form lịch hẹn
function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const appointmentId = document.getElementById('appointment-id').value;
    const petId = document.getElementById('appointment-pet').value;
    const petSelect = document.getElementById('appointment-pet');
    
    // Lấy tên thú cưng
    let petName = null;
    
    if (petId && petId.startsWith("new_")) {
        petName = petId.substring(4); // Lấy tên thú cưng từ value "new_[petName]"
    } else if (petId && petId !== "" && petId !== "new") {
        // Lấy tên từ option đã chọn nếu chọn thú cưng có sẵn
        const selectedOption = petSelect.options[petSelect.selectedIndex];
        if (selectedOption) {
            petName = selectedOption.textContent;
        }
    }
    
    const appointmentData = {
        ownerName: document.getElementById('appointment-owner').value.trim(),
        petId: petId && !petId.startsWith("new_") ? petId : null,
        petName: petName, // Luôn gửi tên thú cưng
        appointmentDateTime: document.getElementById('appointment-datetime').value,
        doctorId: document.getElementById('appointment-doctor').value || null,
        preferredDoctorId: document.getElementById('appointment-preferred-doctor').value || null,
        status: document.getElementById('appointment-status').value,
        notes: document.getElementById('appointment-notes').value
    };
    
    if (!appointmentData.ownerName) {
        alert("Vui lòng nhập tên khách hàng!");
        return;
    }
    
    if (!appointmentData.petId && !appointmentData.petName) {
        alert("Vui lòng chọn thú cưng hoặc tạo mới!");
        return;
    }
    
    if (appointmentId) {
        updateAppointment(appointmentId, appointmentData);
    } else {
        createAppointment(appointmentData);
    }
}

// Tạo lịch hẹn mới
function createAppointment(appointmentData) {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Tạo petAge giả cho trường hợp tạo thú cưng mới
    if (appointmentData.petName && !appointmentData.petId) {
        appointmentData.petAge = 1; // Mặc định là 1 tuổi
    }
    
    fetch('http://localhost:8080/api/appointments', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(appointmentData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tạo lịch hẹn mới');
        }
        return response.json();
    })
    .then(data => {
        alert('Tạo lịch hẹn thành công!');
        closeAllModals();
        loadAppointments();
    })
    .catch(error => {
        console.error('Lỗi khi tạo lịch hẹn:', error);
        alert(`Lỗi khi tạo lịch hẹn: ${error.message}`);
    });
}

// Cập nhật lịch hẹn
function updateAppointment(appointmentId, appointmentData) {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Tạo petAge giả cho trường hợp tạo thú cưng mới
    if (appointmentData.petName && !appointmentData.petId) {
        appointmentData.petAge = 1; // Mặc định là 1 tuổi
    }
    
    // Sử dụng API cập nhật mới
    fetch(`http://localhost:8080/api/appointments/update/${appointmentId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(appointmentData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Không thể cập nhật lịch hẹn (mã lỗi: ${response.status})`);
        }
        return response.json();
    })
    .then(data => {
        alert('Cập nhật lịch hẹn thành công!');
        closeAllModals();
        loadAppointments();
    })
    .catch(error => {
        console.error('Lỗi khi cập nhật lịch hẹn:', error);
        alert(`Lỗi khi cập nhật lịch hẹn: ${error.message}`);
    });
}

// Sửa lịch hẹn
function editAppointment(appointmentId) {
    openAppointmentModal(appointmentId);
} 