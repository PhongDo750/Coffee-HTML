async function loadProductDetails(productId) {
    try {
        // Gửi yêu cầu tới API để lấy chi tiết sản phẩm
        const response = await fetch(`http://localhost:8080/api/v1/product/get-details?productId=${productId}`);
        
        // Kiểm tra xem phản hồi có thành công không
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        // Parse dữ liệu JSON từ API
        const data = await response.json();
        console.log(data);
        
        // Kiểm tra nếu dữ liệu không có hoặc không có phần content
        if (!data) {
            throw new Error('Không có dữ liệu sản phẩm!');
        }

        // Lấy thông tin sản phẩm
        const product = data;

        // Tạo phần HTML để hiển thị sản phẩm
        const productHTML = `
            <div class="grid wide">
                <div class="row">
                    <div class="col c-6">
                        <div class="module_left_1 a-center">
                            <img class="lazyload loaded" src="${product.image}" alt="${product.name}">
                        </div>
                    </div>
                    <div class="col c-6">
                        <div class="module_right_1 a-center">
                            <div class="heading">
                                <h2 class="large_title">${product.name}</h2>
                                <p class="mini_title">Giá: ${product.price.toLocaleString('vi-VN')}₫</p>
                            </div>
                            <div class="purchase">
                                <button id="decrease">-</button>
                                <input type="number" id="quantity" value="1" min="1" readonly>
                                <button id="increase">+</button>
                            </div>
                            <button class="order">Đặt Hàng</button>
                        </div>
                    </div> 
                    <div class="description">
                        <h2>Mô tả sản phẩm</h2>
                        <p class="title">${product.description}</p>
                    </div>
                </div>
            </div>
        `;

        // Chèn HTML sản phẩm vào trang
        const subHeader = document.querySelector('.product-details');
        subHeader.innerHTML = productHTML;

        // Gắn sự kiện cho các nút tăng/giảm số lượng
        document.getElementById('decrease').addEventListener('click', decreaseQuantity);
        document.getElementById('increase').addEventListener('click', increaseQuantity);

    } catch (error) {
        // Hiển thị lỗi nếu có vấn đề khi load sản phẩm
        console.error('Lỗi khi tải sản phẩm:', error.message);
        alert('Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.');
    }
}

// Hàm giảm số lượng sản phẩm
function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput.value > 1) {
        quantityInput.value--;
    }
}

// Hàm tăng số lượng sản phẩm
function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    quantityInput.value++;
}

let currentPage = 0;  // Start at page 0
const pageSize = 10;  // Number of products per page

async function loadProducts(page = 0, size = 10) {
try {
// Fetch products from API
const response = await fetch(`http://localhost:8080/api/v1/product/get-products?page=${page}&size=${size}`);
const data = await response.json();

// Check if data is properly returned
if (!data || !data.content) {
    return;
}

const products = data.content;  // Actual product data
const productList = document.getElementById('product-list');
productList.innerHTML = ''; // Clear the previous content

// Loop through products and create product elements
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
        </div>
    `;

    productItem.addEventListener('click', () => {
        window.location.href = `/product-details.html?productId=${product.productId}`; // Redirect to the product details page
    });

    productList.appendChild(productItem);
});

// Handle pagination controls (Next/Previous buttons)
updatePagination(data);
} catch (error) {
console.error('Error loading products:', error);
}
}

function updatePagination(data) {
const paginationElement = document.getElementById('pagination');
paginationElement.innerHTML = ''; // Clear the old pagination UI

// "Previous" button
const prevButton = document.createElement('button');
prevButton.innerText = 'Previous';
prevButton.disabled = data.number === 0; // Disable if it's the first page
prevButton.onclick = () => loadProducts(data.number - 1, pageSize);
paginationElement.appendChild(prevButton);

// "Next" button
const nextButton = document.createElement('button');
nextButton.innerText = 'Next';
nextButton.disabled = data.number >= data.totalPages - 1; // Disable if it's the last page
nextButton.onclick = () => loadProducts(data.number + 1, pageSize);
paginationElement.appendChild(nextButton);

// Log for debugging
console.log('Pagination:', {
currentPage: data.number,
totalPages: data.totalPages,
});

// Set the current page
currentPage = data.number;
}

// Hàm lấy giá trị query parameter từ URL
function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

window.onload = () => {
    const productId = getQueryParameter('productId'); // Lấy productId từ query parameter
    if (productId) {
        loadProductDetails(productId);
        loadProducts(currentPage, pageSize)
    } else {
        console.error('Product ID not found in URL');
    }
};

