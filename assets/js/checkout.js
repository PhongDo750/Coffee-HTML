document.addEventListener('DOMContentLoaded', async () => {
    // Lấy accessToken từ localStorage
    const accessToken = localStorage.getItem('accessToken');

    // Lấy thông tin người dùng
    try {
        const userResponse = await fetch('http://localhost:8080/api/v1/user/get-information', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user information');
        }

        const userInfo = await userResponse.json();
        
        // Cập nhật thông tin người dùng vào các input
        document.getElementById('userNameInput').value = userInfo.fullName;
        document.getElementById('userEmailInput').value = userInfo.email;
        document.getElementById('userPhoneInput').value = userInfo.phoneNumber;
        document.getElementById('userAddressInput').value = userInfo.address || ''; // Nếu có trường địa chỉ
    } catch (error) {
        console.error('Error fetching user information:', error);
        alert('Có lỗi xảy ra khi lấy thông tin người dùng.');
    }

    // Lấy thông tin sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const products = urlParams.getAll('products[]').map(product => JSON.parse(product));

    const productBody = document.getElementById('product-body');
    let totalPrice = 0;

    // Hiển thị thông tin sản phẩm
    products.forEach(product => {
        const productRow = document.createElement('tr');
        const itemTotalPrice = product.totalPrice; // Lưu giá trị tổng cho sản phẩm

        totalPrice += itemTotalPrice; // Cộng dồn tổng giá trị
        productRow.innerHTML = `
            <td>${product.nameProduct}</td>
            <td>${product.price.toLocaleString('vi-VN')}₫</td>
            <td>${product.quantityOrder}</td>
            <td>${itemTotalPrice.toLocaleString('vi-VN')}₫</td>
        `;
        productBody.appendChild(productRow);
    });

    // Hiển thị tổng tiền
    document.getElementById('totalPrice').innerText = `Tổng tiền: ${totalPrice.toLocaleString('vi-VN')}₫`;

    // Xử lý xác nhận đơn hàng
    document.getElementById('confirmOrderButton').addEventListener('click', () => {
        const paymentMethod = document.getElementById('paymentMethod').value;
        // Tiến hành xử lý đặt hàng ở đây (ví dụ gọi API để lưu đơn hàng)
        alert(`Đơn hàng đã được xác nhận với phương thức thanh toán: ${paymentMethod}`);
    });
});
