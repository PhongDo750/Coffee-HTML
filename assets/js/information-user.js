document.addEventListener("DOMContentLoaded", function() {
    const accessToken = localStorage.getItem("accessToken"); // Lấy access token từ localStorage

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
            const userInfoContainer = document.getElementById('user-info');
            userInfoContainer.innerHTML = `
                <h1>Thông tin cá nhân</h1>
                <div class="user-detail">

                    <label for="image"><strong>Ảnh đại diện:</strong></label>
                    <div id="current-image-container">
                        <img id="current-image" src="${data.imageUrl}" alt="Ảnh đại diện hiện tại" width="150" />
                    </div>

                    <label for="fullName"><strong>Họ và tên:</strong></label>
                    <input type="text" id="fullName" value="${data.fullName}" />
                    
                    <label for="phoneNumber"><strong>Số điện thoại:</strong></label>
                    <input type="text" id="phoneNumber" value="${data.phoneNumber}" />
                    
                    <label for="email"><strong>Email:</strong></label>
                    <input type="email" id="email" value="${data.email}" />

                    <label for="comment-image">Cập nhật ảnh đại diện:
                    <input type="file" id="image" />
                    </label>
                    
                    <button id="btn-update" class="btn-update">Cập nhật thông tin</button>
                </div>
            `;

            document.getElementById('btn-update').addEventListener('click', function() {
                // Tạo đối tượng FormData
                const formData = new FormData();

                // Thêm thông tin người dùng vào formData
                const updatedInfo = {
                    fullName: document.getElementById('fullName').value,
                    phoneNumber: document.getElementById('phoneNumber').value,
                    email: document.getElementById('email').value
                };

                formData.append('changeInfoUser', JSON.stringify(updatedInfo));

                // Thêm ảnh nếu có
                const imageFile = document.getElementById('image').files[0];
                if (imageFile) {
                    formData.append('image', imageFile);
                }

                // Gửi request cập nhật thông tin
                fetch('http://localhost:8080/api/v1/user/change-information', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        alert('Cập nhật thông tin thành công');
                        location.reload();
                    } else {
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
        alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin");
        window.location.assign("login.html");
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchIcon').addEventListener('click', function() {
        const searchContainer = document.getElementById('searchContainer');
        if (searchContainer.style.display === 'none' || searchContainer.style.display === '') {
            searchContainer.style.display = 'flex'; // Hiển thị ô tìm kiếm
        } else {
            searchContainer.style.display = 'none'; // Ẩn ô tìm kiếm
        }
    });

    document.getElementById('searchButton').addEventListener('click', function() {
        const searchQuery = document.querySelector('input[placeholder="Tìm kiếm..."]').value; // Lấy giá trị từ ô tìm kiếm
        const accessToken = 'Bearer ' + localStorage.getItem('accessToken'); // Giả sử bạn lưu access token trong localStorage

        // Gọi API để lấy sản phẩm theo tìm kiếm
        fetch(`http://localhost:8080/api/v1/product/get-products-by-search?search=${encodeURIComponent(searchQuery)}`, {
            method: 'GET',
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Chuyển đổi dữ liệu nhận được thành JSON
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            // Chuyển hướng tới trang mới và truyền dữ liệu
            localStorage.setItem('products', JSON.stringify(data.content)); // Giả sử data.content chứa danh sách sản phẩm
            window.location.href = '/search-product.html'; // Thay đổi thành đường dẫn thực tế của trang mới
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
});
