document.getElementById('logout-link').addEventListener('click', function(event) {
    // Ngăn chặn hành vi mặc định của thẻ a
    event.preventDefault();

    // Xóa accessToken khỏi localStorage
    localStorage.removeItem("accessToken");

    // Chuyển hướng đến trang login.html
    window.location.href = 'login.html';
});
