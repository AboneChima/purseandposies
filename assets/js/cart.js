class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateCartCount();
            if (window.location.pathname.includes('cart.html')) {
                this.renderCart();
                this.setupCartEventListeners();
                this.initializeCheckout();
            }
            this.setupAddToCartListeners();
        });
    }

    setupAddToCartListeners() {
        // Remove nested DOMContentLoaded event
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productItem = button.closest('.product-item');
                const product = {
                    id: Date.now(),
                    name: productItem.querySelector('h4').textContent,
                    price: parseFloat(productItem.querySelector('h6').textContent.replace('$', '')),
                    image: productItem.querySelector('img').src,
                    quantity: 1
                };
                this.addItem(product);
            });
        });
    }

    setupCartEventListeners() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;

        cartItemsContainer.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            if (!cartItem) return;

            const itemId = Number(cartItem.dataset.id);  // Changed from parseInt to Number

            if (e.target.classList.contains('increase-btn')) {
                this.updateQuantity(itemId, 'increase');
            }
            else if (e.target.classList.contains('decrease-btn')) {
                this.updateQuantity(itemId, 'decrease');
            }
            else if (e.target.closest('.remove-item')) {
                this.removeItem(itemId);
            }
        });
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(product);
        }
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`);
        
        // Automatically show PayPal buttons when items are added
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.style.display = 'none';
            document.getElementById('paypal-button-container').style.display = 'block';
            initPayPalButton();
        }
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        // Add this line to update cart summary when cart is empty
        if (this.items.length === 0) {
            const cartSubtotal = document.getElementById('cart-subtotal');
            const cartTax = document.getElementById('cart-tax');
            const cartTotal = document.getElementById('cart-total');
            if (cartSubtotal) cartSubtotal.textContent = '$0.00';
            if (cartTax) cartTax.textContent = '$0.00';
            if (cartTotal) cartTotal.textContent = '$0.00';
        }
    }

    updateQuantity(itemId, action) {
        const item = this.items.find(item => item.id === itemId);  // Fixed comparison
        if (item) {
            if (action === 'increase') {
                item.quantity += 1;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity -= 1;
            }
            this.saveCart();
            this.renderCart();
        }
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    calculateTotal() {
        const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = 0; // Set tax to 0
        const total = subtotal; // Total is now just the subtotal
        return { subtotal, tax, total };
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="products.html" class="filled-button">Continue Shopping</a>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-btn">+</button>
                    </div>
                    <button class="remove-item">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const { subtotal, tax, total } = this.calculateTotal();
        document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    initializeCheckout() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }
                
                // Hide checkout button and show PayPal buttons
                checkoutBtn.style.display = 'none';
                document.getElementById('paypal-button-container').style.display = 'block';
                
                const { total } = this.calculateTotal();
                
                // Initialize PayPal button
                paypal.Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: total.toFixed(2)
                                }
                            }]
                        });
                    },
                    onApprove: (data, actions) => {
                        return actions.order.capture().then((orderData) => {
                            const orderDetails = {
                                orderId: orderData.id,
                                items: this.items,
                                total: total,
                                date: new Date().toISOString(),
                                paymentStatus: orderData.status,
                                payerEmail: orderData.payer.email_address
                            };
                            
                            localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
                            localStorage.removeItem('cart');
                            window.location.href = 'success.html';
                        });
                    }
                }).render('#paypal-button-container');
            });
        }
    }
}

// Initialize cart globally
window.cart = new ShoppingCart();