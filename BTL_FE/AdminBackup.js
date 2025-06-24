document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập và phân quyền
    checkAdminAccess();

    // Thiết lập sự kiện
    setupEventListeners();

    // Khởi tạo tab mặc định
    document.querySelector('.tab-pane.active').style.display = 'block';
});

// Kiểm tra quyền admin và token
function checkAdminAccess() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        redirectToLogin();
        return;
    }

    // Kiểm tra trực tiếp token trong trường hợp token hard-coded admin
    const tokenPayload = parseJwt(token);
    
    // Kiểm tra scope có chứa ADMIN không
    if (tokenPayload && tokenPayload.scope && tokenPayload.scope.includes("ADMIN")) {
        // Hiển thị tên admin
        document.getElementById('admin-name').textContent = tokenPayload.sub || 'Admin';
        // Tải dữ liệu ban đầu
        loadDashboardData();
        return;
    }

    // Nếu không phải token hard-coded, thì kiểm tra qua API
    fetch('http://localhost:8080/auth/introspect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Token không hợp lệ');
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.result || !data.result.valid) {
            console.error('Token không hợp lệ:', data);
            throw new Error('Token không hợp lệ');
        }
        
        // Kiểm tra vai trò từ API
        if (data.result.authorities && Array.isArray(data.result.authorities) && 
            data.result.authorities.includes("ADMIN")) {
            // Hiển thị tên admin
            document.getElementById('admin-name').textContent = data.result.sub || 'Admin';
            // Tải dữ liệu ban đầu
            loadDashboardData();
        } else {
            // Không có quyền admin
            console.error('Người dùng không có quyền admin:', data.result);
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = 'Trangchu2.html';
        }
    })
    .catch(error => {
        console.error('Lỗi xác thực:', error);
        redirectToLogin();
    });
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

    // Sự kiện đóng modal
    document.querySelectorAll('.close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Sự kiện submit form
    document.getElementById('pet-form').addEventListener('submit', handlePetSubmit);
    document.getElementById('service-form').addEventListener('submit', handleServiceSubmit);
    document.getElementById('article-form').addEventListener('submit', handleArticleSubmit);

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
    // Cập nhật trạng thái active cho tab
    document.querySelectorAll('#sidebar nav li').forEach(li => {
        li.classList.remove('active');
    });
    tabElement.classList.add('active');

    // Ẩn tất cả tab-pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
    });

    // Hiển thị tab được chọn
    document.getElementById(tabId).style.display = 'block';

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
    }
}

// Tải dữ liệu tổng quan
function loadDashboardData() {
    const token = localStorage.getItem('token');
    
    // Tải số lượng thú cưng
    fetch('http://localhost:8080/pets/count', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-pets').textContent = (typeof data === 'object' && data.result !== undefined) ? data.result : data;
    })
    .catch(error => console.error('Lỗi khi tải số lượng thú cưng:', error));

    // Tải số lượng dịch vụ
    fetch('http://localhost:8080/services/count', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-services').textContent = (typeof data === 'object' && data.result !== undefined) ? data.result : data;
    })
    .catch(error => console.error('Lỗi khi tải số lượng dịch vụ:', error));

    // Tải số lượng bài viết
    fetch('http://localhost:8080/articles/count', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-articles').textContent = (typeof data === 'object' && data.result !== undefined) ? data.result : data;
    })
    .catch(error => console.error('Lỗi khi tải số lượng bài viết:', error));

    // Tải số lượng người dùng
    fetch('http://localhost:8080/users/count', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-users').textContent = (typeof data === 'object' && data.result !== undefined) ? data.result : data;
    })
    .catch(error => console.error('Lỗi khi tải số lượng người dùng:', error));
}

// ------- QUẢN LÝ THÚ CƯNG -------

// Tải danh sách thú cưng
function loadPets() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8080/pets', {
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

        if (pets.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center">Không có dữ liệu</td>';
            tableBody.appendChild(emptyRow);
            return;
        }

        pets.forEach(pet => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pet.petId}</td>
                <td>${pet.name}</td>
                <td>${pet.species}</td>
                <td>${pet.breed}</td>
                <td>${pet.gender === 'Male' ? 'Đực' : 'Cái'}</td>
                <td>${pet.owner ? pet.owner.username : 'N/A'}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${pet.petId}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${pet.petId}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Thêm sự kiện cho các nút
        document.querySelectorAll('#pets-table-body .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editPet(btn.getAttribute('data-id')));
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
    
    fetch('http://localhost:8080/users', {
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
    
    // Reset form
    form.reset();
    document.getElementById('pet-id').value = '';
    
    if (petId) {
        modalTitle.textContent = 'Chỉnh Sửa Thú Cưng';
        loadPetDetails(petId);
    } else {
        modalTitle.textContent = 'Thêm Thú Cưng';
    }
    
    modal.style.display = 'block';
}

// Tải chi tiết thú cưng để chỉnh sửa
function loadPetDetails(petId) {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8080/pets/${petId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(pet => {
        document.getElementById('pet-id').value = pet.petId;
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
    const isEdit = petId !== '';
    
    const petData = {
        name: document.getElementById('pet-name').value,
        species: document.getElementById('pet-species').value,
        breed: document.getElementById('pet-breed').value,
        gender: document.getElementById('pet-gender').value,
        ownerId: document.getElementById('pet-owner').value,
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
    
    fetch('http://localhost:8080/pets', {
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
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8080/pets/${petId}`, {
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
    
    fetch('http://localhost:8080/services', {
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
    
    fetch(`http://localhost:8080/services/${serviceId}`, {
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
    
    fetch('http://localhost:8080/services', {
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
    
    fetch(`http://localhost:8080/services/${serviceId}`, {
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
                <td>${article.title}</td>
                <td>${article.author || 'Admin'}</td>
                <td>${formatDate(article.createdAt)}</td>
                <td>${getCategoryName(article.category)}</td>
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
    
    fetch(`http://localhost:8080/articles/${articleId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(article => {
        document.getElementById('article-id').value = article.id;
        document.getElementById('article-title').value = article.title;
        document.getElementById('article-category').value = article.category;
        document.getElementById('article-image').value = article.imageUrl || '';
        document.getElementById('article-content').value = article.content;
    })
    .catch(error => console.error('Lỗi khi tải chi tiết bài viết:', error));
}

// Xử lý submit form bài viết
function handleArticleSubmit(e) {
    e.preventDefault();
    
    const articleId = document.getElementById('article-id').value;
    const isEdit = articleId !== '';
    
    const articleData = {
        title: document.getElementById('article-title').value,
        category: document.getElementById('article-category').value,
        imageUrl: document.getElementById('article-image').value,
        content: document.getElementById('article-content').value
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
    
    fetch(`http://localhost:8080/articles/${articleId}`, {
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

// ------- CHỨC NĂNG XÓA -------

// Mở modal xác nhận xóa
let deleteType = null;
let deleteId = null;

function openDeleteModal(type, id) {
    deleteType = type;
    deleteId = id;
    document.getElementById('delete-modal').style.display = 'block';
}

// Xác nhận xóa
function confirmDelete() {
    if (!deleteType || !deleteId) return;
    
    const token = localStorage.getItem('token');
    let url;
    
    switch (deleteType) {
        case 'pet':
            url = `http://localhost:8080/pets/${deleteId}`;
            break;
        case 'service':
            url = `http://localhost:8080/services/${deleteId}`;
            break;
        case 'article':
            url = `http://localhost:8080/articles/${deleteId}`;
            break;
        default:
            return;
    }
    
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Không thể xóa ${deleteType}`);
        }
        return response.text();
    })
    .then(() => {
        closeAllModals();
        
        // Tải lại dữ liệu tương ứng
        switch (deleteType) {
            case 'pet':
                loadPets();
                break;
            case 'service':
                loadServices();
                break;
            case 'article':
                loadArticles();
                break;
        }
        
        alert(`Xóa thành công!`);
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert(`Không thể xóa. Vui lòng thử lại.`);
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
} 
} 
