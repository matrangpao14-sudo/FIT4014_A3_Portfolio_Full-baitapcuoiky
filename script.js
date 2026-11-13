/* ==========================================================================
   FILE: script.js
   MÔ TẢ: Xử lý tương tác Portfolio Filter, Giỏ hàng (localStorage), Modal & Form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. MENU MOBILE HAMBURGER
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Đóng menu khi bấm vào link trên mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // 2. BỘ LỌC DỰ ÁN PORTFOLIO
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 3. MODAL XEM CHI TIẾT DỰ ÁN
    const detailModal = document.getElementById('detailModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = btn.dataset.title;
            document.getElementById('modalCategory').textContent = btn.dataset.category;
            document.getElementById('modalImg').src = btn.dataset.img;
            document.getElementById('modalDesc').textContent = btn.dataset.desc;
            detailModal.classList.add('open');
        });
    });

    closeModalBtn.addEventListener('click', () => detailModal.classList.remove('open'));
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) detailModal.classList.remove('open');
    });

    // 4. QUẢN LÝ GIỎ HÀNG (LƯU LOCALSTORAGE)
    let cart = JSON.parse(localStorage.getItem('fit4014_cart')) || [];

    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartCount = document.getElementById('cartCount');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const toast = document.getElementById('toastNotification');

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
    }

    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    function formatVND(amount) {
        return amount.toLocaleString('vi-VN') + '₫';
    }

    function saveAndRenderCart() {
        localStorage.setItem('fit4014_cart', JSON.stringify(cart));
        
        // Cập nhật số lượng badge
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalItems;

        // Render danh sách
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:#64748b; margin-top:40px;">Giỏ hàng của bạn đang trống.</p>';
            cartTotalPrice.textContent = '0₫';
            return;
        }

        let totalMoney = 0;
        cartItemsContainer.innerHTML = cart.map((item, index) => {
            totalMoney += item.price * item.qty;
            return `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${formatVND(item.price)}</div>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" onclick="removeItem(${index})">Xóa</button>
                </div>
            `;
        }).join('');

        cartTotalPrice.textContent = formatVND(totalMoney);
    }

    // Thêm vào giỏ hàng
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price, 10);
            const img = btn.dataset.img;

            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ id, name, price, img, qty: 1 });
            }

            saveAndRenderCart();
            showToast(`Đã thêm "${name}" vào giỏ!`);
        });
    });

    // Global helper cho nút tăng/giảm/xóa trong giỏ
    window.updateQty = function(index, delta) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        saveAndRenderCart();
    };

    window.removeItem = function(index) {
        cart.splice(index, 1);
        saveAndRenderCart();
    };

    // Thanh toán giả lập
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Vui lòng chọn ít nhất 1 sản phẩm trước khi đặt hàng!');
            return;
        }
        alert('Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã được ghi nhận thành công.');
        cart = [];
        saveAndRenderCart();
        closeCart();
    });

    // 5. FORM LIÊN HỆ
    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('senderName').value;
        alert(`Cảm ơn ${name}! Yêu cầu của bạn đã được gửi thành công.`);
        e.target.reset();
    });

    // Khởi tạo giỏ hàng khi load trang
    saveAndRenderCart();
});
