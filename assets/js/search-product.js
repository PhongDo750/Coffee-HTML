let currentPage = 0;  // Trang hiện tại
const pageSize = 10;  // Số sản phẩm mỗi trang

// Hàm để tải sản phẩm theo từ khóa tìm kiếm và phân trang
async function loadProductsBySearch(searchTerm, page = 0, size = 10) {
    try {
        // Lấy dữ liệu sản phẩm từ localStorage
        const products = JSON.parse(localStorage.getItem('products')) || [];

        // Lọc sản phẩm theo từ khóa tìm kiếm
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Cắt mảng sản phẩm theo trang
        const startIndex = page * size;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + size);

        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Xóa nội dung cũ

        // Hiển thị sản phẩm hoặc thông báo nếu không có sản phẩm
        if (paginatedProducts.length === 0) {
            productList.innerHTML = '<p>Không có sản phẩm nào được tìm thấy.</p>';
        } else {
            paginatedProducts.forEach(product => {
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
        }

        // Cập nhật phân trang
        updatePagination(filteredProducts.length);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Hàm để cập nhật UI phân trang
function updatePagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / pageSize);
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = ''; // Xóa phân trang cũ

    // Nút "Previous"
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Trước';
    prevButton.disabled = currentPage === 0; // Vô hiệu nếu đang ở trang đầu
    prevButton.onclick = () => {
        currentPage--;
        loadProductsBySearch(document.getElementById('searchInput').value, currentPage, pageSize);
    };
    paginationElement.appendChild(prevButton);

    // Nút "Next"
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Tiếp theo';
    nextButton.disabled = currentPage >= totalPages - 1; // Vô hiệu nếu đang ở trang cuối
    nextButton.onclick = () => {
        currentPage++;
        loadProductsBySearch(document.getElementById('searchInput').value, currentPage, pageSize);
    };
    paginationElement.appendChild(nextButton);
}

// Hàm để tải danh mục
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

// Gọi hàm tìm kiếm sản phẩm và tải danh mục khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Hiện ô tìm kiếm khi nhấp vào biểu tượng tìm kiếm
    document.getElementById('searchIcon').addEventListener('click', function(e) {
        e.preventDefault(); // Ngăn chặn hành động mặc định của thẻ a
        const searchContainer = document.getElementById('searchContainer');
        searchContainer.style.display = searchContainer.style.display === 'none' ? 'flex' : 'none'; // Chuyển đổi giữa hiển thị và ẩn
    });

    // Thực hiện tìm kiếm khi nhấn nút Tìm
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
            // Lưu dữ liệu sản phẩm vào localStorage
            localStorage.setItem('products', JSON.stringify(data.content)); // Giả sử data.content chứa danh sách sản phẩm
            currentPage = 0; // Đặt lại trang hiện tại về 0
            loadProductsBySearch(searchQuery, currentPage, pageSize); // Tải sản phẩm tìm kiếm
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });

    // Tải sản phẩm ban đầu và danh mục
    loadProductsBySearch('', currentPage, pageSize); // Tải sản phẩm ban đầu
    loadCategories(); // Gọi hàm loadCategories
});
