document.getElementById("loginButton").addEventListener("click", function(event) {
    event.preventDefault();  // Ngừng hành động mặc định của nút (ví dụ: không tải lại trang)

    // Lấy dữ liệu từ các trường input
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Kiểm tra xem các trường đăng nhập có bị bỏ trống không
    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!");
        return;
    }

    // Kiểm tra nếu là tài khoản admin hard-coded
    if (username === "admin" && (password === "admin" || password === "admin123")) {
        console.log("Sử dụng đăng nhập hardcoded cho admin");
        // Tạo token giả và lưu vào localStorage
        const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIiwiQ1VTVE9NRVIiXSwiZXhwIjoxNzE5OTM1NDA0LCJpYXQiOjE2ODg0MTM0MDR9.JCVHpwgU4ZECyUYAEkNE7ZfbXDjZ9gJkVQsHVImSvZ8";
        localStorage.setItem("token", adminToken);
        localStorage.setItem("username", username);
        console.log("Đăng nhập admin thành công (hard-coded)");
        alert("Đăng nhập thành công với quyền admin!");
        window.location.href = "Admin.html";
        return;
    }

    // Tạo đối tượng dữ liệu cần gửi tới API
    const loginData = {
        username: username,
        password: password
    };

    console.log("Đang gửi request với data:", loginData);

    // Gửi yêu cầu POST tới API backend
    fetch("http://localhost:8080/auth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        console.log("Status code:", response.status);
        console.log("Response headers:", response.headers);
        
        if (!response.ok) {
            return response.json().then(errorData => {
                console.log("Error data:", errorData);
                throw new Error(errorData.message || 'Đăng nhập thất bại');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Response data:", data);

        // Kiểm tra kết quả đăng nhập từ API
        if (data && data.result && data.result.token) {
            // Lưu token và username vào localStorage
            localStorage.setItem("token", data.result.token);
            localStorage.setItem("username", username);
            
            // Kiểm tra token để xác định vai trò người dùng
            const tokenPayload = parseJwt(data.result.token);
            console.log("Token payload:", tokenPayload);
            
            // Kiểm tra nếu là admin thì chuyển đến trang admin
            if (tokenPayload && tokenPayload.roles && tokenPayload.roles.includes("ADMIN")) {
                console.log("Người dùng có quyền admin, chuyển hướng đến trang admin");
                alert("Đăng nhập thành công với quyền admin!");
                window.location.href = "Admin.html";
            } else {
                // Nếu không phải admin thì chuyển đến trang chính
                alert("Đăng nhập thành công!");
                window.location.href = "Trangchu2.html";
            }
        } else {
            console.log("Invalid response format:", data);
            throw new Error('Token không hợp lệ hoặc không tồn tại trong response');
        }
    })
    .catch(error => {
        console.error("Chi tiết lỗi:", error);
        let errorMessage = "Đã xảy ra lỗi trong quá trình đăng nhập";
        
        // Xử lý các loại lỗi cụ thể
        if (error.message.includes("User not existed")) {
            errorMessage = "Tài khoản không tồn tại";
        } else if (error.message.includes("Unauthenticated")) {
            errorMessage = "Sai mật khẩu";
        }
        
        alert(errorMessage);
    });
});

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
