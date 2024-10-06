document.addEventListener("DOMContentLoaded", function() {
    const accessToken = localStorage.getItem("accessToken"); // Giả sử access token được lưu trong localStorage

    if (accessToken) {
        fetch('http://localhost:8080/api/v1/user/get-information', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Tạo HTML động với các input để cho phép cập nhật
            const userInfoContainer = document.getElementById('user-info');
            userInfoContainer.innerHTML = `
                <h1>Thông tin cá nhân</h1>
                <div class="user-detail">
                    <label for="fullName"><strong>Họ và tên:</strong></label>
                    <input type="text" id="fullName" value="${data.fullName}" />
                    
                    <label for="phoneNumber"><strong>Số điện thoại:</strong></label>
                    <input type="text" id="phoneNumber" value="${data.phoneNumber}" />
                    
                    <label for="email"><strong>Email:</strong></label>
                    <input type="email" id="email" value="${data.email}" />
                    
                    <button id="btn-update" class="btn-update">Cập nhật thông tin</button>
                </div>
            `;

            // Xử lý sự kiện khi người dùng nhấn nút "Cập nhật thông tin"
            document.getElementById('btn-update').addEventListener('click', function() {
                // Lấy giá trị từ các input
                const updatedInfo = {
                    fullName: document.getElementById('fullName').value,
                    phoneNumber: document.getElementById('phoneNumber').value,
                    email: document.getElementById('email').value
                };

                // Gọi API để cập nhật thông tin
                fetch('http://localhost:8080/api/v1/user/change-information', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedInfo)
                })
                .then(response => {
                    if (response.ok) {
                        alert('Cập nhật thông tin thành công');
                    } else {
                        console.error('Lỗi khi cập nhật thông tin:', response.statusText);
                        alert('Lỗi khi cập nhật thông tin');
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi cập nhật thông tin:', error);
                });
            });
        })
        .catch(error => {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        });
    } else {
        console.log('Không tìm thấy access token');
    }
});
