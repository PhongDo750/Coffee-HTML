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

let currentPageComment = 0; // Biến để theo dõi trang hiện tại
const commentsPerPage = 5; // Số bình luận trên mỗi trang
async function loadComments(productId, page=0) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/comment/get-comments?productId=${productId}&page=${page}&size=${commentsPerPage}`);
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
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');

            commentItem.innerHTML = `
                <div class="comment-item">
                    <div class="comment-header">
                        <img src="path_to_avatar_image" alt="User Avatar" class="comment-avatar"> 
                        <!-- Avatar: Bạn có thể thay thế bằng ảnh của người dùng -->
                        <div class="comment-info">
                            <span class="comment-user">${comment.nameUser}</span>
                            <div class="comment-rating">
                                ${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}
                            </div>
                            <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="comment-body">
                        <p class="comment-text">${comment.comment}</p>
                        <div class="comment-images">
                            ${comment.commentImages && Array.isArray(comment.commentImages)
                            ? comment.commentImages // Nếu backend trả về danh sách ảnh dạng mảng
                            .map(img => `<img src="${img.trim()}" alt="Comment Image" class="comment-img">`)
                            .join(' ')
                            : '<p>No image available</p>' // Nếu không có hình ảnh thì hiển thị thông báo
                            }
                         </div>
                    </div>
                </div>
            `;
            
            commentList.appendChild(commentItem);
        });

        // Cập nhật trang hiện tại
        document.getElementById('current-page').innerText = currentPage + 1;

        // Kích hoạt / vô hiệu hóa nút điều hướng
        document.getElementById('prev-page').disabled = currentPage === 0;
        document.getElementById('next-page').disabled = data.last; // Nếu đây là trang cuối cùng
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Gắn sự kiện cho nút "Trước" và "Tiếp theo"
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        loadComments(getQueryParameter('productId'), currentPage);
    }
});

// Gọi hàm loadComments lần đầu tiên khi trang tải
loadComments(getQueryParameter('productId'), currentPage);

document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    loadComments(getQueryParameter('productId'), currentPage);
});

// Hàm để reset các ô nhập liệu về mặc định
function resetCommentForm() {
    document.getElementById('comment').value = '';  // Xóa nội dung bình luận
    document.getElementById('comment-image').value = ''; // Xóa ảnh đã tải lên

    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.remove('active'); // Đặt lại trạng thái ngôi sao
    });
}

// Hàm lấy giá trị số sao được chọn
function getSelectedRating() {
    const stars = document.querySelectorAll('.star');
    let rating = 0;

    stars.forEach(star => {
        if (star.classList.contains('active')) {
            rating = star.getAttribute('data-value'); // Lấy số sao được chọn
        }
    });
    return rating;
}

const stars = document.querySelectorAll('.star');

stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        // Loại bỏ class 'active' từ tất cả các ngôi sao
        stars.forEach((s) => s.classList.remove('active'));

        // Thêm class 'active' vào các ngôi sao từ 0 đến ngôi sao được click
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('active');
        }
    });
});

document.getElementById('add-comment-btn').addEventListener('click', async () => {
    const comment = document.getElementById('comment').value; // Lấy giá trị bình luận
    const productId = getQueryParameter('productId'); // Lấy productId từ URL
    const imageFiles = document.getElementById('comment-image').files; // Lấy danh sách ảnh từ input
    const selectedRating = getSelectedRating(); // Lấy giá trị rating đã chọn

    if (comment && selectedRating > 0) {
        await addComment(productId, comment, selectedRating, imageFiles);
        resetCommentForm();
        loadComments(productId);
    }
    else {
        alert('Vui lòng nhập bình luận và chọn số sao!');
    }
});

// Hàm thêm bình luận
async function addComment(productId, comment, rating, imageFile) {
    const commentInput = {
            productId: productId,
            comment: comment,
            rating: rating,
            images: imageFile // Nếu không cần file, có thể bỏ qua
        };
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch('http://localhost:8080/api/v1/comment/create', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json' // Sử dụng JSON, không phải multipart
            },
            body: JSON.stringify(commentInput) // Chuyển dữ liệu thành JSON
        });

        if (response.ok) {
            alert('Bình luận đã được thêm!');
        } else {
            console.error('Lỗi khi thêm bình luận:', response.status);
        }
    } catch (error) {
        console.error('Error adding comment:', error);
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
        //
    } else {
        console.error('Product ID not found in URL');
    }
};

