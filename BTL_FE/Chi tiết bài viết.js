// Hàm lấy tham số từ URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Hàm để lấy tên người dùng từ token
function getUsernameFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded = jwt_decode(token);
            return decoded.sub || 'Ẩn danh';
        } catch (error) {
            console.error('Lỗi giải mã token:', error);
            return 'Người dùng';
        }
    }
    return 'Người dùng';
}

// Hàm để tải bình luận từ API
function loadComments() {
    const articleId = getUrlParameter('id');

    if (!articleId) {
        console.error("Không tìm thấy ID bài viết");
        return;
    }

    fetch(`http://localhost:8080/api/comments/get_all_comment_by_articleId/${articleId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayComments(data);
    })
    .catch(error => {
        console.error("Lỗi khi tải bình luận:", error);
        document.querySelector('.comments-list').innerHTML = '<p class="error-message">Không thể tải bình luận. Vui lòng thử lại sau.</p>';
    });
}

// Hàm hiển thị bình luận
function displayComments(comments) {
    console.log('Comment data:', comments);
    const commentsList = document.querySelector('.comments-list');
    const commentCountDiv = document.querySelector('.comment-count');
    
    // Hiển thị số lượng bình luận
    commentCountDiv.innerHTML = `<strong>${comments.length} bình luận</strong>`;
    
    // Xóa các bình luận cũ trừ phần comment count và form
    const oldComments = commentsList.querySelectorAll('.comment');
    oldComments.forEach(comment => comment.remove());

    // Thêm các bình luận mới
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        
        const formattedDate = formatDate(comment.createdAt);
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <img src="Image/user.png" alt="Avatar" class="avatar">
                <div class="comment-info">
                    <span class="name">${comment.name || getUsernameFromToken()}</span>
                    <span class="date">${formattedDate}</span>
                </div>
            </div>
            <div class="comment-text">
                ${comment.content}
            </div>
        `;

        // Chèn bình luận vào trước nút "Xem thêm"
        const loadMoreButton = commentsList.querySelector('.load-more');
        if (loadMoreButton) {
            commentsList.insertBefore(commentElement, loadMoreButton);
        } else {
            commentsList.appendChild(commentElement);
        }
    });
}

// Hàm định dạng ngày
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', options);
}

// Hàm đăng bình luận mới
function postComment(event) {
    event.preventDefault();
    const articleId = getUrlParameter('id');
    const commentContent = document.querySelector('.comment-form textarea').value;

    if (!commentContent.trim()) {
        alert("Vui lòng nhập nội dung bình luận!");
        return;
    }

    if (!articleId) {
        alert("Không tìm thấy bài viết!");
        return;
    }

    const newComment = {
        content: commentContent,
        name: getUsernameFromToken(),
        createdAt: new Date().toISOString()
    };

    fetch(`http://localhost:8080/api/comments/${articleId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.querySelector('.comment-form textarea').value = '';
        loadComments();
    })
    .catch(error => {
        console.error("Lỗi khi gửi bình luận:", error);
        alert("Không thể gửi bình luận. Vui lòng thử lại sau.");
    });
}

// Hàm để tải chi tiết bài viết từ API
function loadArticleDetail() {
    const articleId = getUrlParameter('id');

    if (!articleId) {
        console.error("Không tìm thấy ID bài viết");
        return;
    }

    fetch(`http://localhost:8080/api/articles/get_article_by_id/${articleId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayArticleDetail(data);
    })
    .catch(error => {
        console.error("Lỗi khi tải bài viết:", error);
        document.querySelector('.article-container').innerHTML = '<p class="error-message">Không thể tải bài viết. Vui lòng thử lại sau.</p>';
    });
}

// Hàm hiển thị chi tiết bài viết
function displayArticleDetail(article) {
    const titleElement = document.querySelector('.article-title');
    const authorElement = document.querySelector('.article-meta .author');
    const dateElement = document.querySelector('.article-meta .date');
    const contentElement = document.querySelector('.article-content');

    if (titleElement) titleElement.textContent = article.title;
    if (authorElement) authorElement.textContent = `Tác giả: ${article.author}`;
    if (dateElement) dateElement.textContent = `Ngày đăng: ${formatDate(article.createdAt)}`;
    if (contentElement) contentElement.textContent = article.content;
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadArticleDetail();
    loadComments();
    
    // Thêm sự kiện cho nút gửi bình luận
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            postComment(e);
        });
    }

    // Thêm sự kiện cho nút "Xem thêm"
    const loadMoreButton = document.querySelector('.load-more');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function() {
            // Implement load more logic here
            console.log('Load more comments...');
        });
    }
});
