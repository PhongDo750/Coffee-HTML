let currentPage = 0;
const pageSize = 10;
let currentProductId = null;
let currentOrderPage = 0;
const orderPageSize = 10;

// Hàm tải danh sách sản phẩm
async function loadProducts(page = 0, size = 10) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/product/get-products?page=${page}&size=${size}`);
        const data = await response.json();

        if (!data || !data.content) {
            return;
        }

        const products = data.content;
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';

        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');

            productItem.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>Giá: ${product.price.toLocaleString('vi-VN')}₫</p>
                    <button class="edit-btn">Chỉnh sửa</button>
                    <button class="delete-btn">Xóa</button>
                </div>
            `;

            const editButton = productItem.querySelector('.edit-btn');
            editButton.addEventListener('click', (event) => {
                event.stopPropagation();
                currentProductId = product.productId;
                showUpdateForm(product);
            });

            const deleteButton = productItem.querySelector('.delete-btn');
            deleteButton.addEventListener('click', async (event) => {
                event.stopPropagation();
                const confirmDelete = confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?');
                if (confirmDelete) {
                    await deleteProduct(product.productId);
                    loadProducts(currentPage, pageSize);
                }
            });

            productList.appendChild(productItem);
        });

        updatePagination(data);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Hàm tải danh sách đơn mua theo trạng thái
async function loadOrdersByState(page = 0, size = 10) {
    try {
        const state = document.getElementById('orderState').value; // Lấy trạng thái đơn hàng
        const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
        
        const response = await fetch(`http://localhost:8080/api/v1/shop-order/get-orders?state=${state}&page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken // Thêm token vào header
            }
        });

        // Kiểm tra xem phản hồi có thành công hay không
        if (!response.ok) {
            throw new Error('Error loading orders');
        }

        const data = await response.json();

        // Kiểm tra xem dữ liệu có hợp lệ không
        if (!data || !data.content) {
            return;
        }

        const orders = data.content; // Danh sách đơn hàng
        const orderListContent = document.getElementById('order-list-content'); // Lấy phần tử chứa danh sách đơn hàng
        orderListContent.innerHTML = ''; // Xóa nội dung cũ

        // Duyệt qua từng đơn hàng
        orders.forEach(order => {
            console.log(order);
    
            // Tạo phần tử div chứa thông tin đơn hàng
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item'); // Thêm class cho phần tử đơn hàng
    
            // Thêm thông tin về mã đơn hàng
            orderItem.innerHTML = `
                <div class="order-info">
                    <h3>Mã đơn hàng: ${order.orderId}</h3>
                    <p>Tổng giá: ${order.totalPrice.toLocaleString('vi-VN')}₫</p> <!-- Tổng giá của đơn hàng -->
                </div>
                <div class="order-products">
                    ${order.productOrderOutputs.map(product => `
                        <div class="order-product-item">
                            <img src="${product.image || '#'}" alt="${product.productName}" class="order-product-image" />
                            <div class="order-product-info">
                                <p><strong>${product.productName}</strong></p>
                                <p>Số lượng: ${product.quantityOrder}</p>
                                <p>Giá: ${product.price.toLocaleString('vi-VN')}₫</p>
                                <p>Tổng: ${product.totalPrice.toLocaleString('vi-VN')}₫</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Nếu trạng thái là "PENDING_PAYMENT", hiển thị nút xác nhận và hủy đơn hàng
            if (order.state === 'PENDING_PAYMENT') {
                orderItem.innerHTML += `
                    <div class="order-actions">
                        <button class="btn-confirm" onclick="acceptOrder(${order.orderId})">Xác nhận đơn hàng</button>
                        <button class="btn-cancel" onclick="showCancelReason(${order.orderId})">Hủy đơn hàng</button>
                    </div>
                `;
            }

            // Nếu đơn hàng đã bị hủy và có lý do, hiển thị nút "Chi tiết đơn hủy"
            if (order.cancelOrderOutput && order.cancelOrderOutput.reason) {
                orderItem.innerHTML += `
                    <div class="cancel-details">
                        <button onclick="toggleCancelDetails(${order.orderId})">Chi tiết đơn hủy</button>
                        <div class="cancel-details" id="cancel-details-${order.orderId}" style="display:none;">
                            <p><strong>Lý do hủy:</strong> ${order.cancelOrderOutput.reason}</p>
                            <p><strong>Người hủy:</strong> ${order.cancelOrderOutput.cancelerId || 'Không xác định'}</p>
                        </div>
                    </div>
                `;
            }

            // Thêm đơn hàng vào danh sách
            orderListContent.appendChild(orderItem);
        });

        updateOrderPagination(data); // Cập nhật phân trang
    } catch (error) {
        console.error('Error loading orders:', error); // In ra lỗi nếu có
    }
}

// Hàm xóa sản phẩm
async function deleteProduct(productId) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/product/delete?productId=${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        if (!response.ok) {
            throw new Error('Error deleting product');
        }
        alert('Sản phẩm đã được xóa!');
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Cập nhật phân trang cho sản phẩm
function updatePagination(data) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = data.totalPages;
    for (let i = 0; i < totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i + 1;
        button.disabled = i === currentPage;

        button.addEventListener('click', () => {
            currentPage = i;
            loadProducts(currentPage, pageSize);
        });

        pagination.appendChild(button);
    }
}

// Cập nhật phân trang cho đơn mua
function updateOrderPagination(data) {
    const pagination = document.getElementById('paginationOrders'); // Đổi ID cho đơn hàng
    pagination.innerHTML = '';

    const totalPages = data.totalPages;
    for (let i = 0; i < totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i + 1;
        button.disabled = i === currentOrderPage;

        button.addEventListener('click', () => {
            currentOrderPage = i;
            loadOrdersByState(currentOrderPage, orderPageSize);
        });

        pagination.appendChild(button);
    }
}


// Hiển thị form cập nhật sản phẩm
function showUpdateForm(product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image;
    document.getElementById('updateFormContainer').style.display = 'block';
    document.getElementById('overlay').style.display = 'block'; // Hiển thị overlay làm mờ
}

// Ẩn form cập nhật sản phẩm
function hideUpdateForm() {
    document.getElementById('updateFormContainer').style.display = 'none';
    document.getElementById('overlay').style.display = 'none'; // Ẩn overlay
    currentProductId = null;
}

// Xử lý sự kiện khi gửi form cập nhật
document.getElementById('updateForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (currentProductId) {
        const updatedProduct = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: document.getElementById('productPrice').value,
            image: document.getElementById('productImage').value,
        };
        console.log('Updating product with data:', updatedProduct);
        await updateProduct(currentProductId, updatedProduct);
        loadProducts(currentPage, pageSize);
        hideUpdateForm();
    }
});

// Cập nhật sản phẩm
async function updateProduct(productId, updatedProduct) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/product/update?productId=${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            },
            body: JSON.stringify(updatedProduct)
        });
        if (!response.ok) {
            throw new Error('Error updating product');
        }
        alert('Sản phẩm đã được cập nhật!');
    } catch (error) {
        console.error('Error updating product:', error);
    }
}

// Hàm xác nhận đơn hàng
async function acceptOrder(orderId) {
    const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
    try {
        const response = await fetch(`http://localhost:8080/api/v1/shop-order/accept-order?orderId=${orderId}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken // Thêm token vào header
            }
        });

        if (response.ok) {
            alert('Đơn hàng đã được xác nhận!');
            loadOrdersByState(); // Tải lại danh sách đơn hàng
        } else {
            alert('Có lỗi xảy ra khi xác nhận đơn hàng.');
        }
    } catch (error) {
        console.error('Error accepting order:', error);
    }
}

// Hàm hiển thị cửa sổ ghi lý do hủy
function showCancelReason(orderId) {
    const reason = prompt("Vui lòng ghi lý do hủy đơn hàng:");
    if (reason) {
        cancelOrder(orderId, reason);
    }
}

// Hàm hủy đơn hàng
async function cancelOrder(orderId, reason) {
    const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
    const cancelOrderInput = {
        orderId: orderId,
        reason: reason
    };

    try {
        const response = await fetch(`http://localhost:8080/api/v1/shop-order/cancel-order`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken, // Thêm token vào header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cancelOrderInput) // Chuyển đổi dữ liệu sang định dạng JSON
        });

        alert('Đơn hàng đã được hủy!');
        loadOrdersByState(); // Tải lại danh sách đơn hàng
    } catch (error) {
        console.error('Error canceling order:', error);
    }
}

function toggleCancelDetails(orderId) {
    const detailsElement = document.getElementById(`cancel-details-${orderId}`);
    if (detailsElement.style.display === 'none') {
        detailsElement.style.display = 'block';
    } else {
        detailsElement.style.display = 'none';
    }
}

async function submitProduct() {
    const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
    if (!accessToken) {
        alert('Vui lòng đăng nhập để tạo sản phẩm!');
        return;
    }

    const productInput = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseInt(document.getElementById('price').value),
        image: document.getElementById('image').value
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/product/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productInput)
        });

        alert('Sản phẩm đã được tạo thành công!');
        // Ẩn form và hiển thị lại danh sách sản phẩm
        showTab('edit-product');
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Lỗi kết nối, không thể tạo sản phẩm.');
    }
}

// Gán hàm submit vào sự kiện submit của form
document.getElementById('createProductForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngăn form reload trang
    submitProduct(); // Gọi hàm submitProduct để tạo sản phẩm
});

// Hàm hiển thị tab
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none'; // Ẩn tất cả các tab
    });
    const activeTab = document.getElementById(tabId);
    activeTab.classList.add('active');
    activeTab.style.display = 'block'; // Hiện tab đang chọn
}

// Sự kiện khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    loadProducts(currentPage, pageSize); // Load danh sách sản phẩm ban đầu

    const orderTab = document.querySelector('li[onclick="showTab(\'order-list\')"]');
    orderTab.addEventListener('click', () => {
        loadOrdersByState(currentOrderPage, orderPageSize); // Load đơn mua khi nhấn vào tab Đơn mua
    });
});
