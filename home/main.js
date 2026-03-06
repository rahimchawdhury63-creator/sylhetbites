// ==========================================
// SylhetBites Cart System
// ==========================================

// Initialize cart array from localStorage (Professional way to persist without a DB)
let cart = JSON.parse(localStorage.getItem('sylhetBitesCart')) || [];

// DOM Elements
const cartIcon = document.getElementById('cart-icon');
const cartOverlay = document.getElementById('cart-overlay');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartBadge = document.getElementById('cart-badge');
const cartTotalPrice = document.getElementById('cart-total-price');

// Toggle Cart Sidebar
function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
    renderCart();
}

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
}

cartIcon.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Add to Cart Function
function addToCart(name, price, image) {
    // Check if item already exists
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }
    
    // Save, Render, and Open Cart
    saveCart();
    renderCart();
    openCart();
    
    // Quick visual feedback
    cartIcon.style.transform = "scale(1.2)";
    setTimeout(() => cartIcon.style.transform = "scale(1)", 200);
}

// Update Quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    // Remove if quantity reaches 0
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart();
    renderCart();
}

// Save to LocalStorage
function saveCart() {
    localStorage.setItem('sylhetBitesCart', JSON.stringify(cart));
}

// Render Cart HTML
function renderCart() {
    cartItemsContainer.innerHTML = ''; // Clear current
    let total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#666; margin-top:20px;">Your cart is currently empty.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            totalItems += item.quantity;
            
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.price} TK</p>
                        <div class="cart-controls">
                            <button onclick="updateQuantity(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    // Update UI Elements
    cartBadge.innerText = totalItems;
    cartTotalPrice.innerText = `${total} TK`;
}

// Initialize on load
renderCart();

