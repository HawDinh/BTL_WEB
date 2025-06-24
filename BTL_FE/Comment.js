// Hàm lấy tham số từ URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Hàm để tải bình luận từ API
function loadComments() {
    const articleId = getUrlParameter('id');  // Lấy id từ URL

    if (!articleId) {
        alert("Không tìm thấy bài viết!");
        return;
    }

    // Gửi yêu cầu đến API để lấy bình luận của bài viết
    fetch(`http://localhost:8080/api/comments/get_all_comment_by_articleId/${articleId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Thêm token nếu cần
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())  // Chuyển đổi phản hồi thành JSON
    .then(data => {
        displayComments(data);  // Hiển thị danh sách bình luận
    })
    .catch(error => {
        console.error("Lỗi:", error);
        alert("Không thể tải bình luận.");
    });
}

// Hàm hiển thị bình luận
function displayComments(comments) {
    const commentsSection = document.getElementById('comments-section');
    commentsSection.innerHTML = '';  // Xóa danh sách cũ

    // Hiển thị bình luận mới
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <img src="Image/user.png" alt="Avatar" class="avatar">
                <span class="name">${comment.author}</span>
                <span class="date">${comment.createdAt}</span>
            </div>
            <div class="comment-text">
                ${comment.content}
            </div>
        `;

        commentsSection.appendChild(commentElement);
    });
}

// Hàm đăng bình luận mới
function postComment() {
    const articleId = getUrlParameter('id');  // Lấy id từ URL
    const commentContent = document.querySelector('.input-comment').value;

    if (!commentContent) {
        alert("Vui lòng nhập nội dung bình luận!");
        return;
    }

    if (!articleId) {
        alert("Không tìm thấy bài viết!");
        return;
    }

    const newComment = {
        content: commentContent,
        author: "Người dùng",  // Bạn có thể thay bằng tên người dùng thực tế
        createdAt: new Date().toISOString()
    };

    // Gửi yêu cầu đến API để đăng bình luận mới
    fetch(`http://localhost:8080/api/comments/${articleId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)  // Gửi dữ liệu bình luận dưới dạng JSON
    })
    .then(response => response.json())
    .then(data => {
        alert("Bình luận đã được gửi!");
        loadComments();  // Tải lại bình luận sau khi đăng thành công
    })
    .catch(error => {
        console.error("Lỗi:", error);
        alert("Không thể gửi bình luận.");
    });
}

// Gọi hàm khi trang được tải
window.onload = function() {
    loadComments();  // Tải danh sách bình luận
    document.querySelector('.post-comment').addEventListener('click', postComment);  // Gửi bình luận mới khi nhấn nút
};
