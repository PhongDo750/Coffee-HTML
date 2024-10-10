let userOrderInput;

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    // Gọi hàm để lấy thông tin người dùng
    await fetchUserInfo(accessToken);

    // Lấy thông tin sản phẩm từ URL
    const products = getProductsFromUrl();
    const totalPrice = displayProducts(products);

    document.getElementById('confirmOrderButton').addEventListener('click', () => {
        handleOrder(products, totalPrice, accessToken);
    });

    // Xử lý kết quả thanh toán từ VNPay
    // Đảm bảo trang được tải lại để bắt sự kiện
    if (window.location.search.includes('vnp_ResponseCode')) {
        handleVnPayResponse(accessToken);
    }
});

// Hàm lấy thông tin người dùng
async function fetchUserInfo(accessToken) {
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
        document.getElementById('userNameInput').value = userInfo.fullName;
        document.getElementById('userEmailInput').value = userInfo.email;
        document.getElementById('userPhoneInput').value = userInfo.phoneNumber;
        document.getElementById('userAddressInput').value = userInfo.address || '';
    } catch (error) {
        console.error('Error fetching user information:', error);
        alert('Có lỗi xảy ra khi lấy thông tin người dùng.');
    }
}

// Hàm lấy thông tin sản phẩm từ URL và hiển thị
function getProductsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.getAll('products[]').map(product => JSON.parse(product));
}

function displayProducts(products) {
    const productBody = document.getElementById('product-body');
    let totalPrice = 0;

    products.forEach(product => {
        const productRow = document.createElement('tr');
        const itemTotalPrice = product.totalPrice;

        totalPrice += itemTotalPrice;
        productRow.innerHTML = `
            <td><img src="${product.imageUrl}" class="product_image"></td>
            <td>${product.nameProduct}</td>
            <td>${product.price.toLocaleString('vi-VN')}₫</td>
            <td>${product.quantityOrder}</td>
            <td>${itemTotalPrice.toLocaleString('vi-VN')}₫</td>
        `;
        productBody.appendChild(productRow);
    });

    document.getElementById('totalPrice').innerText = `Tổng tiền: ${totalPrice.toLocaleString('vi-VN')}₫`;
    return totalPrice;
}

// Hàm xử lý đặt hàng
async function handleOrder(products, totalPrice, accessToken) {
    const fullName = document.getElementById('userNameInput').value;
    const phoneNumber = document.getElementById('userPhoneInput').value;
    const email = document.getElementById('userEmailInput').value;
    const address = document.getElementById('userAddressInput').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    userOrderInput = {
        fullName,
        phoneNumber,
        email,
        address,
        paymentMethod,
        totalPrice,
        productOrderInputs: products.map(product => ({
            cartId: product.cartId,
            productId: product.productId,
            nameProduct: product.nameProduct,
            price: product.price,
            image: product.imageUrl,
            quantityOrder: product.quantityOrder,
            totalPrice: product.totalPrice
        }))
    }

    await placeOrder(userOrderInput, accessToken, paymentMethod);
}

// Hàm đặt hàng
async function placeOrder(userOrderInput, accessToken, paymentMethod) {
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

        const data = await orderResponse.json();
        console.log(data);
        const orderId = data.orderId
        const amount = data.amount

        localStorage.setItem('orderId', orderId);
        localStorage.setItem('amount', amount);
        localStorage.setItem('paymentMethod', paymentMethod);

        if (paymentMethod === 'vnpay') {
            window.location.href = 'payment.html';
        } else {
            window.location.href = 'order.html';
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
}
