document.addEventListener('DOMContentLoaded', function() {
    // Ensure cart is initialized
    if (!window.cart) {
        window.cart = new ShoppingCart();
    }

    // Handle Shop Now buttons
    const shopNowButtons = document.querySelectorAll('.shop-now');
    shopNowButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productItem = this.closest('.product-item');
            const productName = productItem.querySelector('h4').textContent;
            const productPrice = productItem.querySelector('h6').textContent;
            const productImage = productItem.querySelector('img').src;
            
            // Add item to cart
            window.cart.addItem({
                id: Date.now(),
                name: productName,
                price: parseFloat(productPrice.replace('$', '')),
                image: productImage,
                quantity: 1
            });
            
            // Redirect directly to checkout instead of cart
            window.location.href = 'cart.html#checkout';
        });
    });
});