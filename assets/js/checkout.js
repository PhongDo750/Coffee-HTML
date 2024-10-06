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

        console.log(product); // Kiểm tra dữ liệu sản phẩm

        totalPrice += itemTotalPrice; // Cộng dồn tổng giá trị
        productRow.innerHTML = `
            <td><img src="${product.imageUrl}" class="product_image"></td>
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
    document.getElementById('confirmOrderButton').addEventListener('click', async () => {
        const fullName = document.getElementById('userNameInput').value;
        const phoneNumber = document.getElementById('userPhoneInput').value;
        const email = document.getElementById('userEmailInput').value;
        const address = document.getElementById('userAddressInput').value;
        const paymentMethod = document.getElementById('paymentMethod').value;

        // Tạo đối tượng UserOrderInput
        const userOrderInput = {
            fullName,
            phoneNumber,
            email,
            address,
            paymentMethod,
            productOrderInputs: products.map(product => ({
                cartId: product.cartId, // ID giỏ hàng
                productId: product.productId, // ID sản phẩm
                nameProduct: product.nameProduct, // Tên sản phẩm
                price: product.price, // Giá sản phẩm
                image: product.imageUrl, // Hình ảnh sản phẩm
                quantityOrder: product.quantityOrder, // Số lượng đã đặt
                totalPrice: product.totalPrice // Tổng giá cho sản phẩm
            }))
        };

        // Gọi API để đặt hàng
        try {
            const orderResponse = await fetch('http://localhost:8080/api/v1/order', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userOrderInput)
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to place order');
            }

            alert('Đơn hàng đã được xác nhận thành công!');
            // Bạn có thể chuyển hướng người dùng đến trang khác nếu cần
            window.location.href = 'order.html'; // Ví dụ chuyển đến trang thành công
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
        }
    });
});
