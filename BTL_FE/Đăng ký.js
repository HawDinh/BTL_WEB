document.querySelector('#loginButton').addEventListener('click', function (event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của nút

    // Lấy dữ liệu từ các trường nhập liệu
    const username = document.getElementById('username').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const genderMale = document.getElementById('genderMale').checked;
    const genderFemale = document.getElementById('genderFemale').checked;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAgreement = document.getElementById('termsAgreement').checked;

    // Kiểm tra các trường bắt buộc
    if (!username || !phone || !password || !confirmPassword) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Kiểm tra checkbox giới tính
    let gender = "";
    if (genderMale) {
        gender = "Nam";
    } else if (genderFemale) {
        gender = "Nữ";
    }

    if (!gender) {
        alert("Vui lòng chọn giới tính!");
        return;
    }

    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp!");
        return;
    }

    // Kiểm tra checkbox "Tôi đồng ý"
    if (!termsAgreement) {
        alert("Bạn phải đồng ý với điều khoản sử dụng để tiếp tục!");
        return;
    }

    // Tạo đối tượng dữ liệu cần gửi
    const formData = {
        username: username,
        password: password,
        phoneNumber: phone,
        gender: gender
    };

    // Gửi dữ liệu tới API bằng phương thức POST
    fetch('http://localhost:8080/users', { // Đổi URL API theo backend
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Có lỗi xảy ra trong quá trình đăng ký!");
        }
        return response.json();
    })
    .then(data => {
        console.log('Kết quả từ server:', data);
        if (data.code === 1000) { // Giả sử code 1000 là thành công
            alert("Đăng ký thành công!");
            window.location.href = "Đăng nhập.html"; // Chuyển hướng sau khi đăng ký thành công
        } else {
            alert(`Đăng ký thất bại: ${data.message}`);
        }
    })
    .catch(error => {
        console.error("Lỗi:", error);
        alert("Đã xảy ra lỗi, vui lòng thử lại!");
    });
});

// Đảm bảo chỉ chọn 1 checkbox cho giới tính
document.getElementById('genderMale').addEventListener('change', function () {
    if (this.checked) {
        document.getElementById('genderFemale').checked = false;
    }
});

document.getElementById('genderFemale').addEventListener('change', function () {
    if (this.checked) {
        document.getElementById('genderMale').checked = false;
    }
});
