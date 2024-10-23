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

let currentPage = 0;  // Trang hiện tại
const pageSize = 10;  // Số sản phẩm mỗi trang

// Hàm để tải sản phẩm theo danh mục và phân trang
async function loadProductsByCategory(categoryId, page = 0, size = 10) {
    try {
        // Fetch sản phẩm từ API theo categoryId, page và size
        const response = await fetch(`http://localhost:8080/api/v1/product/get-products-by-category?categoryId=${categoryId}&page=${page}&size=${size}`);
        const data = await response.json();

        // Kiểm tra dữ liệu trả về
        if (!data || !data.content) {
            return;
        }

        const products = data.content;  // Dữ liệu sản phẩm thực tế
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Xóa nội dung cũ

        // Duyệt qua danh sách sản phẩm và tạo các phần tử hiển thị
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

            // Điều hướng đến trang chi tiết sản phẩm khi click
            productItem.addEventListener('click', () => {
                window.location.href = `/product-details.html?productId=${product.productId}`; // Redirect to the product details page
            });

            productList.appendChild(productItem);
        });

        // Cập nhật phân trang
        updatePagination(data, categoryId);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Hàm để cập nhật UI phân trang
function updatePagination(data, categoryId) {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = ''; // Xóa phân trang cũ

    // Nút "Previous"
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Trước';
    prevButton.disabled = data.number === 0; // Vô hiệu nếu đang ở trang đầu
    prevButton.onclick = () => loadProductsByCategory(categoryId, data.number - 1, pageSize); // Quay về trang trước
    paginationElement.appendChild(prevButton);

    // Nút "Next"
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Tiếp theo';
    nextButton.disabled = data.number >= data.totalPages - 1; // Vô hiệu nếu đang ở trang cuối
    nextButton.onclick = () => loadProductsByCategory(categoryId, data.number + 1, pageSize); // Tới trang tiếp theo
    paginationElement.appendChild(nextButton);

    // In ra log để kiểm tra
    console.log('Pagination:', {
        currentPage: data.number,
        totalPages: data.totalPages,
    });

    // Cập nhật trang hiện tại
    currentPage = data.number;
}

async function loadCategoryName(categoryId) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/category/get?categoryId=${categoryId}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const category = await response.json();
        
        if (category && category.name) {
            // Cập nhật tên danh mục
            document.querySelector('.name-category').innerText = category.name;
        } else {
            console.error('Category not found or has no name:', category);
        }
    } catch (error) {
        console.error('Error loading category name:', error);
    }
}

function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

window.onload = () => {
    loadCategories()
    const categoryId = getQueryParameter('categoryId'); // Lấy categoryId từ query parameter
    if (categoryId) {
        loadCategoryName(categoryId)
        loadProductsByCategory(categoryId, currentPage, pageSize); // Tải sản phẩm theo danh mục
    } else {
        console.error('Category ID not found in URL');
    }
};