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

        document.querySelector('.order').addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('quantity').value); // Lấy số lượng từ input
            addProductToCart(productId, quantity); // Gọi hàm thêm sản phẩm vào giỏ hàng
        });

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

async function addProductToCart(productId, quantity) {
    try {
        const accessToken = localStorage.getItem('accessToken'); // Lấy accessToken từ localStorage
        const cartInput = { // Tạo đối tượng cartInput để gửi
            productId: productId,
            quantityOrder: quantity
        };

        const response = await fetch('http://localhost:8080/api/v1/cart/add', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cartInput) // Chuyển đổi đối tượng cartInput sang JSON
        });

        if (response.ok) {
            alert('Sản phẩm đã được thêm vào giỏ hàng!'); // Thông báo thành công
        } else {
            throw new Error('Lỗi khi thêm sản phẩm vào giỏ hàng');
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
}

let currentPageComment = 0;
const pageCommentSize = 10;
async function loadComments(productId, page=0, size=10) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/comment/get-comments?productId=${productId}&page=${page}&size=${size}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        if (!data || !data.content) {
            return;
        }

        const comments = data.content
        const commentList = document.getElementById('comment-list');
        commentList.innerHTML = ''; // Xóa nội dung cũ

        comments.forEach(comment => {
            console.log(comment)
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');

            commentItem.innerHTML = `
                <p><strong>Rating:</strong> ${comment.rating}</p>
                    <p><strong>Comment:</strong> ${comment.comment}</p>
                    <p><strong>Images:</strong> ${comment.images ? `<img src="${comment.images}" alt="Comment Image" style="max-width: 100px;">` : 'No image'}</p>
                `;

            commentList.appendChild(commentItem);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Gắn sự kiện cho nút thêm bình luận
document.getElementById('add-comment-btn').addEventListener('click', () => {
    const commentText = document.getElementById('comment').value;
    const productId = getQueryParameter('productId');
    const rating = document.getElementById('rating').value;

    if (commentText) {
        addComment(productId, commentText, rating); // Gọi hàm thêm bình luận
    } else {
        alert('Vui lòng nhập bình luận!');
    }
});

// Hàm thêm bình luận
async function addComment(productId, text, rating) {
    try {
        const accessToken = localStorage.getItem('accessToken'); // Lấy access token từ localStorage
        const commentInput = {
            productId: productId,
            comment: text,
            rating: rating
            // thêm các trường khác nếu cần
        };
        const response = await fetch('http://localhost:8080/api/v1/comment/create', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentInput) // Chuyển đổi đối tượng commentInput sang JSON
        });

        if (response.ok) {
            alert('Bình luận đã được thêm!'); // Thông báo thành công
            document.getElementById('comment').value = ''; // Xóa ô nhập liệu
            document.getElementById('rating').value = '1';
            loadComments(productId, currentPageComment, pageCommentSize); // Tải lại danh sách bình luận
        } else {
            throw new Error('Lỗi khi thêm bình luận');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Có lỗi xảy ra khi thêm bình luận. Vui lòng thử lại sau.');
    }
}

// Hàm lấy giá trị query parameter từ URL
function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

window.onload = () => {
    const productId = getQueryParameter('productId'); // Lấy productId từ query parameter
    if (productId) {
        loadCategories();
        loadProductDetails(productId);
        loadProducts(currentPage, pageSize);
        loadComments(productId, currentPageComment, pageCommentSize);
    } else {
        console.error('Product ID not found in URL');
    }
};

