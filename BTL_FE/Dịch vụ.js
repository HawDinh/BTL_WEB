
// Lắng nghe sự kiện hover với thời gian trì hoãn
const actions = document.getElementById('actions');
const userMenu = document.getElementById('user-menu');

// Thời gian trì hoãn khi chuột di vào
let hoverTimeout;

actions.addEventListener('mouseenter', () => {
    hoverTimeout = setTimeout(() => {
        actions.classList.add('hovered'); // Thêm lớp để hiển thị bảng sau thời gian trì hoãn
    }, 300); // Trì hoãn 300ms (thời gian trì hoãn trước khi bảng xuất hiện)
});

actions.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout); // Hủy bỏ thời gian trì hoãn nếu chuột rời trước khi bảng xuất hiện
    actions.classList.remove('hovered'); // Ẩn bảng khi chuột rời khỏi
});

// Lắng nghe sự kiện di chuột ra khỏi bảng
userMenu.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout); // Hủy bỏ nếu chuột di vào bảng
    actions.classList.add('hovered'); // Đảm bảo bảng vẫn hiển thị khi chuột trong bảng
});

userMenu.addEventListener('mouseleave', () => {
    actions.classList.remove('hovered'); // Ẩn bảng khi chuột rời khỏi bảng
});