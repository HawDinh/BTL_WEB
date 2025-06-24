// Hàm để xem bình luận

const next = document.querySelector('.next');
const prev = document.querySelector('.prev');
const comment = document.querySelector('#list-comment');

// Kiểm tra các phần tử tồn tại trước khi thêm event listener
if (next && prev && comment) {
const commentItem = document.querySelectorAll('#list-comment .item');
let translateY = 0;
let count = commentItem.length;

next.addEventListener('click', function (event) {
  event.preventDefault();
  if (count === 100) {
    // Xem hết bình luận
    return false;
  }
  translateY -= 400;
  comment.style.transform = `translateY(${translateY}px)`;
  count--;
});

prev.addEventListener('click', function (event) {
  event.preventDefault();
  if (count === 100) {
    // Xem hết bình luận
    return false;
  }
  translateY += 400;
  comment.style.transform = `translateY(${translateY}px)`;
  count++;
});
}

// Lắng nghe sự kiện hover với thời gian trì hoãn
const actions = document.getElementById('actions');
const userMenu = document.getElementById('user-menu');

// Thời gian trì hoãn khi chuột di vào
let hoverTimeout;

// Kiểm tra xem phần tử actions có tồn tại không
if (actions) {
actions.addEventListener('mouseenter', () => {
  hoverTimeout = setTimeout(() => {
    actions.classList.add('hovered'); // Thêm lớp để hiển thị bảng sau thời gian trì hoãn
  }, 300); // Trì hoãn 300ms (thời gian trì hoãn trước khi bảng xuất hiện)
});

actions.addEventListener('mouseleave', () => {
  clearTimeout(hoverTimeout); // Hủy bỏ thời gian trì hoãn nếu chuột rời trước khi bảng xuất hiện
  actions.classList.remove('hovered'); // Ẩn bảng khi chuột rời khỏi
});
}

// Kiểm tra xem phần tử userMenu có tồn tại không
if (userMenu) {
// Lắng nghe sự kiện di chuột ra khỏi bảng
userMenu.addEventListener('mouseenter', () => {
  clearTimeout(hoverTimeout); // Hủy bỏ nếu chuột di vào bảng
    if (actions) actions.classList.add('hovered'); // Đảm bảo bảng vẫn hiển thị khi chuột trong bảng
});

userMenu.addEventListener('mouseleave', () => {
    if (actions) actions.classList.remove('hovered'); // Ẩn bảng khi chuột rời khỏi bảng
});
}

// Hàm lấy tham số từ URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Hàm kiểm tra đăng nhập
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  
  console.log('Kiểm tra đăng nhập - Token:', token ? "Có" : "Không");
  console.log('Kiểm tra đăng nhập - Username:', username);
  
  // Phải có cả token và username
  return !!(token && username);
}

// Kiểm tra đăng nhập khi trang được tải
window.onload = function() {
  console.log('Trang được tải:', window.location.pathname);
  
  // Cập nhật tên người dùng trong header nếu đã đăng nhập
  const usernameDisplay = document.getElementById('username-display');
  if (usernameDisplay) {
    const username = localStorage.getItem('username');
    if (username) {
      usernameDisplay.textContent = username;
  }
}
};

// Xử lý trực tiếp nút Quản lý thú cưng
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM đã được tải');
  
  // Tìm link "Quản lý thú cưng" bằng text content
  try {
    const allLinks = document.querySelectorAll('.user-menu a');
    if (allLinks && allLinks.length > 0) {
      const petManagementLink = Array.from(allLinks).find(
          link => link && (link.textContent.includes('Quản lý thú cưng') || (link.href && link.href.includes('Thú cưng.html')))
  );
  
  if (petManagementLink) {
      console.log('Tìm thấy link quản lý thú cưng:', petManagementLink);
      
      petManagementLink.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Đã click vào link quản lý thú cưng');
          
          const isLoggedIn = checkLoginStatus();
          console.log('Trạng thái đăng nhập:', isLoggedIn);
          
          if (isLoggedIn) {
              console.log('Đã đăng nhập, chuyển hướng đến trang thú cưng');
              window.location.href = 'Thú cưng.html';
          } else {
              console.log('Chưa đăng nhập, chuyển hướng đến trang đăng nhập');
              window.location.href = 'Đăng nhập.html';
          }
      });
  } else {
          console.log('Không tìm thấy link quản lý thú cưng trong danh sách');
      }
    } else {
      console.log('Không tìm thấy phần tử .user-menu a hoặc danh sách rỗng');
    }
  } catch (e) {
    console.error('Lỗi khi xử lý link quản lý thú cưng:', e.message);
  }
});
  
