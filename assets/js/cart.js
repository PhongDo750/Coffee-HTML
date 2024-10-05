let cartCurrentPage = 0;  // Start at page 0 for cart
const cartPageSize = 10;  // Number of products per page

let selectedProducts = new Set(); // Dùng Set để lưu sản phẩm đã chọn

async function loadProductsInCart(page = 0, size = 10) {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/cart/get?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products in cart');
        }

        const cartData = await response.json();

        if (!cartData || cartData.content.length === 0) {
            console.error('No products found in cart');
            document.getElementById('cart-body').innerHTML = '<tr><td colspan="7">Giỏ hàng trống</td></tr>'; // Thay đổi số cột
            return;
        }

        const cartContainer = document.getElementById('cart-body');
        cartContainer.innerHTML = '';

        cartData.content.forEach(product => {
            const productRow = document.createElement('tr');
            productRow.innerHTML = `
                <td><input type="checkbox" class="select-product-checkbox" data-id="${product.cartId}"></td> <!-- Thêm checkbox -->
                <td><img src="${product.imageUrl}" alt="${product.nameProduct}" class="product_image"></td>
                <td><h4>${product.nameProduct}</h4></td>
                <td>${product.price.toLocaleString('vi-VN')}₫</td>
                <td>${product.quantityOrder}</td>
                <td>${(product.totalPrice).toLocaleString('vi-VN')}₫</td>
                <td></td>
            `;

            const removeButton = document.createElement('button');
            removeButton.innerText = 'Xóa';
            removeButton.className = 'remove-button';
            removeButton.onclick = () => deleteProductFromCart(product.cartId);

            const buttonCell = productRow.querySelector('td:last-child');
            buttonCell.appendChild(removeButton);

            cartContainer.appendChild(productRow);
        });

        // Cập nhật sự kiện cho các checkbox
        document.querySelectorAll('.select-product-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const productId = this.getAttribute('data-id');
                if (this.checked) {
                    selectedProducts.add(productId); // Thêm sản phẩm vào danh sách chọn
                } else {
                    selectedProducts.delete(productId); // Bỏ sản phẩm khỏi danh sách chọn
                }
            });
        });

        updateCartPagination(cartData);
    } catch (error) {
        console.error('Error loading products in cart:', error);
    }
}


function updateCartPagination(data) {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = ''; // Xóa nội dung phân trang cũ

    // Tạo nút "Previous"
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Previous';
    prevButton.disabled = data.number === 0; // Vô hiệu hóa nếu là trang đầu tiên
    prevButton.onclick = () => loadProductsInCart(data.number - 1, cartPageSize); // Gọi hàm tải lại trang trước
    paginationElement.appendChild(prevButton);

    // Tạo nút "Next"
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.disabled = data.number >= data.totalPages - 1; // Vô hiệu hóa nếu là trang cuối cùng
    nextButton.onclick = () => loadProductsInCart(data.number + 1, cartPageSize); // Gọi hàm tải lại trang sau
    paginationElement.appendChild(nextButton);

    // Ghi log cho việc gỡ lỗi
    console.log('Pagination:', {
        currentPage: data.number,
        totalPages: data.totalPages,
    });

    // Cập nhật số trang hiện tại
    cartCurrentPage = data.number;
}

// Hàm xóa sản phẩm khỏi giỏ hàng
async function deleteProductFromCart(cartId) {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/cart/delete?cartId=${cartId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        });

        if (response.ok) {
            console.log('Sản phẩm đã được xóa khỏi giỏ hàng');
            loadProductsInCart(cartCurrentPage, cartPageSize); // Tải lại giỏ hàng sau khi xóa sản phẩm
        } else {
            console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng');
        }
    } catch (error) {
        console.error('Error deleting product from cart:', error);
    }
}

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

document.getElementById('orderButton').addEventListener('click', async () => {
    // Lấy tất cả các checkbox đã được chọn
    const selectedCheckboxes = document.querySelectorAll('.select-product-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm để đặt hàng!');
        return;
    }

    // Tạo danh sách các cartId từ những checkbox đã chọn
    const cartIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

    try {
        const accessToken = localStorage.getItem('accessToken'); // Lấy accessToken từ localStorage
        const response = await fetch(`http://localhost:8080/api/v1/cart/get-product-before-ordering?cartIds=${cartIds.join(',')}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken, // Thêm accessToken vào header
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products before ordering');
        }

        const productsBeforeOrder = await response.json(); // Chuyển phản hồi thành JSON

        // Chuyển hướng đến trang checkout.html và gửi thông tin sản phẩm qua URL
        const orderPageUrl = 'checkout.html'; // Đường dẫn đến trang checkout
        const queryParams = new URLSearchParams();

        // Chuyển dữ liệu sản phẩm thành chuỗi để thêm vào URL
        productsBeforeOrder.forEach(product => {
            queryParams.append('products[]', JSON.stringify(product)); // Sử dụng productsBeforeOrder thay vì products
        });

        // Gửi thông tin sản phẩm qua URL
        window.location.href = `${orderPageUrl}?${queryParams.toString()}`;
    } catch (error) {
        console.error('Error fetching products before ordering:', error);
        alert('Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại!'); // Thông báo lỗi
    }
});


// Hàm chạy khi trang được tải
window.onload = () => {
    loadProductsInCart(cartCurrentPage, cartPageSize); // Tải sản phẩm trong giỏ hàng khi trang tải
    loadCategories()
};
