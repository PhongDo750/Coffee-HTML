async function loadCategories() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/category/get-categories');
        const categories = await response.json();

        // Kiểm tra dữ liệu trả về
        if (!categories || categories.length === 0) {
            console.error('Invalid category data:', categories);
            return;
        }

        const dropdownContent = document.querySelector('.dropdown_content');
        dropdownContent.innerHTML = ''; // Xóa nội dung cũ

        // Duyệt qua các danh mục và tạo các phần tử <li> mới
        categories.forEach(category => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#">${category.name}</a>`; // Không trỏ trực tiếp vào href
            const anchorTag = li.querySelector('a'); // Lấy thẻ <a> bên trong li
            anchorTag.addEventListener('click', (event) => {
                event.preventDefault(); // Ngăn hành vi mặc định của thẻ <a> (không chuyển hướng ngay)
                window.location.href = `/category-products.html?categoryId=${category.categoryId}`; // Chuyển hướng đến trang chứa sản phẩm của category
            });
            dropdownContent.appendChild(li);
        });

        // Hiển thị dropdown khi hover vào mục "Sản phẩm"
        const dropdown = document.querySelector('.dropdown');
        dropdown.addEventListener('mouseenter', () => {
            dropdownContent.style.display = 'block'; // Hiển thị khi hover vào
        });

        dropdown.addEventListener('mouseleave', () => {
            dropdownContent.style.display = 'none'; // Ẩn khi không còn hover
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
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
// Load the first page when the window loads
window.onload = () => {
loadCategories();
loadProducts(currentPage, pageSize);
}