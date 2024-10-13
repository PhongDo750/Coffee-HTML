document.addEventListener('DOMContentLoaded', () => {
    const amount = localStorage.getItem('amount');
    document.getElementById('amount').value = amount ? `${amount} ₫` : '0 ₫';
});

// Xử lý khi nhấn nút thanh toán
document.getElementById('paymentForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Lấy thông tin từ localStorage
    const accessToken = localStorage.getItem('accessToken');
    const orderId = localStorage.getItem('orderId');
    const paymentMethod = localStorage.getItem('paymentMethod'); // Mặc định nếu không có

    // Kiểm tra thông tin trước khi gửi yêu cầu
    if (!accessToken || !orderId || !paymentMethod) {
        console.error('Thiếu thông tin thanh toán.');
        alert('Có lỗi xảy ra khi thanh toán. Vui lòng kiểm tra lại thông tin.');
        return;
    }

    // Gọi API thanh toán
    try {
        const paymentResponse = await fetch(`http://localhost:8080/api/v1/payment?orderId=${orderId}&method=${paymentMethod}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json(); // Lấy chi tiết lỗi từ server
            throw new Error(`Failed to process payment: ${errorData.message}`);
        }

        const result = await paymentResponse.text(); // Kết quả từ API
        console.log(result); // Kết quả từ API
        if (result === 'SUCCESS') {
            alert('Thanh toán thành công!');
            localStorage.removeItem('orderId');
            localStorage.removeItem('amount');
            localStorage.removeItem('paymentMethod');
            window.location.href = 'order.html';
        } else {
            alert('Thanh toán thất bại. Vui lòng thanh toán lại')
            location.reload();
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
    }
});

