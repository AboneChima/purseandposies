// Get cart items from localStorage
function getCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart;
}

// Calculate cart total
function calculateTotal(cart) {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
}

function initPayPalButton() {
    const cart = getCartItems();
    if (cart.length === 0) {
        document.getElementById('paypal-button-container').innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'paypal',
        },

        createOrder: function(data, actions) {
            const cart = getCartItems(); // Get fresh cart data
            const total = calculateTotal(cart);
            
            return actions.order.create({
                purchase_units: [{
                    description: `Purses & Posies Order (${cart.length} items)`,
                    amount: {
                        currency_code: "USD",
                        value: total,
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: total
                            }
                        }
                    },
                    items: cart.map(item => ({
                        name: item.name,
                        unit_amount: {
                            currency_code: "USD",
                            value: item.price
                        },
                        quantity: item.quantity
                    }))
                }]
            });
        },

        onApprove: function(data, actions) {
            return actions.order.capture().then(function(orderData) {
                console.log('Payment captured:', orderData);  // Add this log
                
                const cart = getCartItems();
                const orderDetails = {
                    orderId: orderData.id,
                    items: cart,
                    total: calculateTotal(cart),
                    date: new Date().toISOString(),
                    paymentStatus: orderData.status,  // Add payment status
                    payerEmail: orderData.payer.email_address  // Add payer info
                };
                
                // Save order details BEFORE redirect
                localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
                
                // Clear cart AFTER saving order
                localStorage.removeItem('cart');
                
                // Redirect to success page
                window.location.href = 'success.html?orderId=' + orderData.id;
            }).catch(function(error) {
                console.error('Payment capture error:', error);
                alert('There was an error processing your payment. Please try again.');
            });
        },

        onError: function(err) {
            console.error('PayPal Error:', err);
            alert('There was an error processing your payment. Please try again.');
        }
    }).render('#paypal-button-container');
}