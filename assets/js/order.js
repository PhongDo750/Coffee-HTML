// Hàm lấy danh sách đơn hàng theo trạng thái
function getOrdersByState(state) {
    const accessToken = localStorage.getItem('accessToken');
    const orderList = document.getElementById('order-list');

    // Đặt tab đang hoạt động
    setActiveTab(state);

    // Xóa danh sách hiện tại và hiển thị thông báo đang tải
    orderList.innerHTML = 'Loading...';

    // Kiểm tra token đăng nhập
    if (!accessToken) {
        orderList.innerHTML = '<p>Error: No access token found. Redirecting to login...</p>';
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    // Gửi yêu cầu để lấy đơn hàng theo trạng thái
    fetchOrdersByState(state, accessToken)
        .then(data => displayOrders(data, state))
        .catch(error => handleFetchError(error));
}

// Hàm gửi request để lấy dữ liệu đơn hàng theo trạng thái
function fetchOrdersByState(state, accessToken) {
    return fetch(`http://localhost:8080/api/v1/order/get-orders-by-state?state=${state}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch orders. Status: ${response.status}`);
        }
        return response.json();
    });
}

// Hàm xử lý hiển thị danh sách đơn hàng
function displayOrders(data, state) {
    const orderList = document.getElementById('order-list');
    orderList.innerHTML = ''; // Xóa nội dung hiện tại

    if (data.content && data.content.length > 0) {
        data.content.forEach(order => {
            const orderElement = createOrderElement(order, state);
            orderList.appendChild(orderElement);
        });
    } else {
        orderList.innerHTML = '<p>No orders found for this state.</p>'; // Nếu không có đơn hàng
    }
}

// Hàm tạo một phần tử hiển thị cho từng đơn hàng
function createOrderElement(order, state) {
    const orderElement = document.createElement('div');
    orderElement.classList.add('order-item');

    let orderDetails = `<div class="product-table">`;

    if (Array.isArray(order.productOrderOutputs)) {
        order.productOrderOutputs.forEach(product => {
            orderDetails += `
                <div class="product-row">
                    <div class="product-cell"><img src="${product.image || '#'}" alt="${product.productName || 'Product'}"/></div>
                    <div class="product-cell">${product.productName || 'Unknown'}</div>
                    <div class="product-cell">₫${(product.price || 0).toLocaleString()}</div>
                    <div class="product-cell">${product.quantityOrder || 0}</div>
                    <div class="product-cell">₫${(product.totalPrice || 0).toLocaleString()}</div>
                </div>
            `;
        });
    }

    orderDetails += `</div>`;

    //Hiển thị nút "Hủy đơn hàng" và "Nút chi tiết đơn hủy"
    orderDetails += `
    <div class="order-summary">
        ${state === 'PENDING_PAYMENT' ? `<button class="cancel-button" onclick="cancelOrder(${order.orderId})">Hủy đơn hàng</button>` : ''}
        ${state !== 'PENDING_PAYMENT' && order.cancelOrderOutput && order.cancelOrderOutput.reason ? `<button class="cancel-button" onclick="toggleCancelDetails(${order.orderId})">Chi tiết đơn hủy</button>` : ''}
        <p class="total-price">Total Price: ₫${(order.totalPrice || 0).toLocaleString()}</p>
    </div>
    `;

    // Nếu đơn hàng đã bị hủy và có lý do, hiển thị nút "Chi tiết đơn hủy"
    if (order.cancelOrderOutput && order.cancelOrderOutput.reason) {
        orderDetails += `
            <div class="cancel-details" id="cancel-details-${order.orderId}" style="display:none;">
            <p><strong>Lý do hủy:</strong> ${order.cancelOrderOutput.reason}</p>
            <p><strong>Người hủy:</strong> ${order.cancelOrderOutput.cancelerId}</p>
            
        `;
    }

    orderElement.innerHTML = orderDetails;
    return orderElement;
}

// Hàm xử lý lỗi khi lấy dữ liệu đơn hàng
function handleFetchError(error) {
    const orderList = document.getElementById('order-list');
    console.error('Error fetching orders:', error);
    orderList.innerHTML = `<p>Failed to load orders. Error: ${error.message}</p>`;
}

// Hàm đặt trạng thái tab đang hoạt động
function setActiveTab(state) {
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.state === state);
    });
}

// Hàm hủy đơn hàng
function cancelOrder(orderId) {
    // Hiển thị form input cho lý do hủy đơn
    const reason = prompt("Vui lòng nhập lý do hủy đơn hàng:");

    // Nếu người dùng không nhập lý do thì không tiến hành hủy
    if (!reason || reason.trim() === '') {
        alert('Bạn phải nhập lý do để hủy đơn hàng.');
        return;
    }

    const accessToken = localStorage.getItem('accessToken');

    // Gửi yêu cầu hủy đơn hàng kèm theo lý do hủy và orderId
    fetch(`http://localhost:8080/api/v1/order/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderId: orderId,
            reason: reason // Gửi orderId và lý do hủy đơn trong request body
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to cancel order. Status: ${response.status}`);
        }

        return response.text().then(text => text ? JSON.parse(text) : {});
    })
    .then(() => {
        alert('Đơn hàng đã được hủy thành công.');
        const activeState = document.querySelector('.tab-button.active').dataset.state;
        getOrdersByState(activeState); // Cập nhật danh sách đơn hàng theo trạng thái đã chọn
    })
    .catch(error => {
        console.error('Error canceling order:', error);
        alert(`Failed to cancel order. Error: ${error.message}`);
    });
}

// Hàm xử lý ấn vào nút "Chi tiết đơn hủy"
function toggleCancelDetails(orderId) {
    const detailsElement = document.getElementById(`cancel-details-${orderId}`);
    if (detailsElement.style.display === 'none') {
        detailsElement.style.display = 'block';
    } else {
        detailsElement.style.display = 'none';
    }
}

// Gọi hàm lấy đơn hàng khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    getOrdersByState('PENDING_PAYMENT'); // Trạng thái mặc định là 'PENDING_PAYMENT'
});
