// Hàm hiển thị thông tin tài khoản
function showAccountInfo() {
    document.getElementById("content-area").innerHTML = `
        <h2>Thông tin tài khoản</h2>
        <button>Tên user: Trinh Le X B</button><br>
        <button>Tên pet: BuBu</button><br>
        <button>Số điện thoại: 0xxxxxxx</button><br>
        <button>Email: bachtlx222@gmail.com</button><br>
    `;
}

// Hàm hiển thị thiết lập lại thông tin
function showSetupInfo() {
    document.getElementById("content-area").innerHTML = `
        <h2>Thiết lập lại thông tin</h2>
        <form>
            <label for="username">Tên user:</label>
            <input type="text" id="username" value="Trinh Le Xuan Bach"><br><br>
            
            <label for="petname">Tên pet:</label>
            <input type="text" id="petname" value="Bubu"><br><br>
            
            <label for="phone">Số điện thoại:</label>
            <input type="text" id="phone" value="0xxxxxxx"><br><br>
            
            <label for="email">Email:</label>
            <input type="email" id="email" value="bachtlx@gmail.com"><br><br>
            
            <button type="submit">Lưu thay đổi</button>
        </form>
    `;
}

// Hàm hiển thị sửa mật khẩu
function showChangePassword() {
    document.getElementById("content-area").innerHTML = `
        <h2>Sửa mật khẩu</h2>
        <form>
            <label for="current-password">Mật khẩu hiện tại:</label>
            <input type="password" id="current-password"><br><br>
            
            <label for="new-password">Mật khẩu mới:</label>
            <input type="password" id="new-password"><br><br>
            
            <label for="confirm-password">Nhập lại mật khẩu mới:</label>
            <input type="password" id="confirm-password"><br><br>
            
            <button type="submit">Cập nhật mật khẩu</button>
        </form>
    `;
}

// Hàm hiển thị lịch đã đăng ký
function showRegisterHistory() {
    document.getElementById("content-area").innerHTML = `
        <h2>Lịch đã đăng ký</h2>
        <table border="1">
            <tr>
                <th>Ngày đăng ký</th>
                <th>Thông tin đăng ký</th>
            </tr>
            <tr>
                <td>2024-11-29</td>
                <td>Đăng ký tài khoản mới</td>
            </tr>
            <tr>
                <td>2024-11-25</td>
                <td>Đổi mật khẩu</td>
            </tr>
        </table>
    `;
}

// Hàm hiển thị phần "Khác"
function showOthers() {
    document.getElementById("content-area").innerHTML = `
        <h2>Khác</h2>
        <p>Thông tin thêm về tài khoản có thể được thêm vào đây.</p>
        <a href="Check-in.html">Trang check-in cho lễ tân</a><br>
        <a href="Bác sĩ.html">Trang cho bác sĩ</a>
    `;
}









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