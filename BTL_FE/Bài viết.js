// Hàm định dạng ngày tháng
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Hàm hiển thị danh sách bài viết
function renderArticles(articles) {
    const articleList = document.querySelector('.article-list');
    articleList.innerHTML = ''; // Xóa nội dung cũ

    articles.forEach(article => {
        const articleItem = document.createElement('div');
        articleItem.classList.add('article-item');

        const title = document.createElement('h2');
        title.textContent = article.title;

        const author = document.createElement('p');
        author.classList.add('author');
        author.textContent = `Tác giả: ${article.author}`;

        const date = document.createElement('p');
        date.classList.add('date');
        date.textContent = `Ngày đăng: ${formatDate(article.createdAt)}`;

        const content = document.createElement('p');
        content.classList.add('content');
        content.textContent = article.content;

        const detailButton = document.createElement('button');
        detailButton.textContent = 'Xem chi tiết';
        detailButton.addEventListener('click', () => {
            window.location.href = `Chi tiết bài viết.html?id=${article.id}`;
        });

        articleItem.appendChild(title);
        articleItem.appendChild(author);
        articleItem.appendChild(date);
        articleItem.appendChild(content);
        articleItem.appendChild(detailButton);

        articleList.appendChild(articleItem);
    });
}

// Hàm tải danh sách bài viết từ API
function loadArticles() {
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }

    fetch('http://localhost:8080/api/articles/get_all_article', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Có lỗi khi tải danh sách bài viết!');
        }
        return response.json();
    })
    .then(data => {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        renderArticles(data);
    })
    .catch(error => {
        console.error("Lỗi:", error);
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        const articleList = document.querySelector('.article-list');
        articleList.innerHTML = `
            <div class="error-message">
                Không thể tải danh sách bài viết. Vui lòng thử lại sau.
            </div>
        `;
    });
}

// Hàm gửi dữ liệu bài viết
function submitArticle(event) {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const author = document.getElementById('author').value.trim();

    if (!title || !content || !author) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    const articleData = {
        title: title,
        content: content,
        author: author
    };

    fetch('http://localhost:8080/api/articles', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Có lỗi xảy ra trong quá trình đăng bài!');
        }
        return response.json();
    })
    .then(data => {
        alert("Đăng bài thành công!");
        document.getElementById('post-article-form').reset();
        loadArticles(); // Tải lại danh sách bài viết
    })
    .catch(error => {
        console.error("Lỗi:", error);
        alert("Đã xảy ra lỗi, vui lòng thử lại!");
    });
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
    
    // Thêm sự kiện cho form đăng bài
    const form = document.getElementById('post-article-form');
    if (form) {
        form.addEventListener('submit', submitArticle);
    }
});
