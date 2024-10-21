async function createCategory(event) {
    event.preventDefault(); // Ngăn chặn việc gửi form theo cách mặc định
    const categoryName = document.getElementById('categoryName').value;
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch('http://localhost:8080/api/v1/category/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name: categoryName }) // Gửi tên danh mục trong body
        });

        if (response.ok) {
            alert('Tạo mới danh mục thành công!');
            document.getElementById('createCategoryForm').reset(); // Đặt lại form
            loadCategories(); // Tải lại danh sách danh mục
        } else {
            alert('Lỗi khi tạo mới danh mục!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
}

async function loadCategories() {
    const accessToken = localStorage.getItem('accessToken'); // Thay thế bằng mã token thật

    try {
        const response = await fetch('http://localhost:8080/api/v1/category/get-categories', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const categories = await response.json();
            const categoryList = document.getElementById('categoryList');
            categoryList.innerHTML = ''; // Xóa nội dung cũ

            categories.forEach(category => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${category.name}</td>
                    <td>
                        <button class="button-delete" onclick="deleteCategory(${category.categoryId})">Xóa</button>
                        <button class="button-add" onclick="addProduct(${category.categoryId})">Thêm sản phẩm</button>
                        <button class="button-show-products" onclick="showProducts(${category.categoryId})">Xem sản phẩm</button>
                    </td>
                `;
                categoryList.appendChild(row);
            });
        } else {
            alert('Lỗi khi tải danh mục!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
}

async function deleteCategory(categoryId) {
    const accessToken = localStorage.getItem('accessToken'); // Thay thế bằng mã token thật

    if (confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/category/delete?categoryId=${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                alert('Xóa danh mục thành công!');
                loadCategories(); // Tải lại danh mục
            } else {
                alert('Lỗi khi xóa danh mục!');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
    }
}

async function addProduct(categoryId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`http://localhost:8080/api/v1/product/get-products-not-in-category?categoryId=${categoryId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const products = await response.json();
        console.log(products);

        const productList = document.getElementById('productList');
        productList.innerHTML = ''; // Xóa nội dung cũ

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px;"></td>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td><button onclick="selectProduct(${product.productId}, ${categoryId})">Thêm</button></td>
            `;
            productList.appendChild(row);
        });

        // Hiển thị form thêm sản phẩm
        openOverlay(); // Gọi hàm openOverlay để hiển thị overlay
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
}

function openOverlay() {
    document.getElementById('productOverlay').style.display = 'flex';  // Hiển thị overlay
    document.body.classList.add('overlay-active');  // Thêm lớp để ngăn cuộn (nếu cần)
}

function closeOverlay() {
    document.getElementById('productOverlay').style.display = 'none';  // Ẩn overlay
    document.body.classList.remove('overlay-active');  // Xóa lớp khi overlay đóng
}

async function selectProduct(productId, categoryId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`http://localhost:8080/api/v1/product/add-product-to-category?categoryId=${categoryId}&productId=${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            alert('Thêm sản phẩm thành công!');
            closeOverlay();
            loadCategories(); // Tải lại danh mục sau khi thêm sản phẩm
        } else {
            alert('Lỗi khi thêm sản phẩm!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
}

async function showProducts(categoryId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`http://localhost:8080/api/v1/product/get-products-by-category?categoryId=${categoryId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const products = data.content;
            const productList = document.getElementById('productList');
            productList.innerHTML = ''; // Xóa nội dung cũ

            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px;"/></td>
                    <td>${product.name}</td>
                    <td>${product.price}</td>
                    <td>
                        <button onclick="deleteProductFromCategory(${product.productId}, ${categoryId})">Xóa</button>
                    </td>
                `;
                productList.appendChild(row);
            });

            // Hiển thị overlay
            openOverlay();
        } else {
            alert('Lỗi khi tải sản phẩm!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
}

async function deleteProductFromCategory(productId, categoryId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`http://localhost:8080/api/v1/product/delete-product-from-category?categoryId=${categoryId}&productId=${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            alert('Xóa sản phẩm thành công!');
            // Cập nhật lại danh sách sản phẩm
            showProducts(categoryId); // Gọi hàm để tải lại danh sách sản phẩm
        } else {
            alert('Lỗi khi xóa sản phẩm!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
}

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.style.display = 'none'; // Ẩn tất cả tab
    });

    const activeTab = document.getElementById(tabName);
    if (tabName === 'edit-category') {
        loadCategories(); // Tải danh mục khi mở tab chỉnh sửa danh mục
    }
    activeTab.style.display = 'block'; // Hiển thị tab đã chọn
}
