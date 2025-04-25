// Modified renderCart function
async function renderCart() {
    // Load products data first
    const products = await fetch('products.json').then(res => res.json());
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cartItems');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartTotalEl = document.getElementById('cartTotal');
    const customerOrderTotalEl = document.getElementById('customerOrderTotal');
    const shippingCost = 10;

    // Reset containers
    cartItems.innerHTML = '';
    cartItemsContainer.innerHTML = '';

    let subtotal = 0;

    cart.forEach((cartItem, index) => {
        // Find the corresponding product
        const product = products.find(p => p.id == cartItem.product_id);
        if (!product) return;

        const itemTotal = product.price * cartItem.quantity;
        subtotal += itemTotal;

        // Cart summary section (right)
        const summaryItem = document.createElement('div');
        summaryItem.className = 'cart-item';
        summaryItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="cart-details">
                <span>${product.name}</span>
                <p>Unit: $${product.price.toFixed(2)}</p>
                <label>Qty: 
                    <input type="number" min="1" value="${cartItem.quantity}" 
                           data-id="${product.id}" class="cart-qty">
                </label>
                <p class="item-total">Total: $${itemTotal.toFixed(2)}</p>
                <button class="remove-item" data-id="${product.id}">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(summaryItem);

        // Customer Order section (left)
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="name">${product.name}</div>
            <div class="price">$${product.price.toFixed(2)}</div>
            <div class="quantity">${cartItem.quantity}</div>
            <div class="total">$${itemTotal.toFixed(2)}</div>
        `;
        cartItems.appendChild(cartItemEl);
    });

    // Update all totals
    customerOrderTotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalEl.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;

    // Update cart icon
    initCartIcon();

    // Add event listeners
    addCartEventListeners();
}

function addCartEventListeners() {
    // Quantity change
    document.querySelectorAll('.cart-qty').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.target.getAttribute('data-id');
            const newQty = parseInt(e.target.value);
            
            if (newQty >= 1) {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const itemIndex = cart.findIndex(item => item.product_id == productId);
                
                if (itemIndex >= 0) {
                    cart[itemIndex].quantity = newQty;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart(); // re-render
                }
            }
        });
    });

    // Remove item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-id');
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            cart = cart.filter(item => item.product_id != productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart(); // re-render
        });
    });
}

// Initialize cart icon
function initCartIcon() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const iconSpan = document.querySelector('.icon-cart span');
    if (iconSpan) {
        const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
        iconSpan.innerText = totalQuantity;
    }
}

// Form validation
function validateCheckoutForm() {
    const personalForm = document.getElementById('personalForm');
    const deliveryForm = document.getElementById('deliveryForm');
    const paymentForm = document.getElementById('paymentForm');
    
    // Validate personal details
    if (!personalForm.checkValidity()) {
        alert('Please fill all personal details correctly');
        return false;
    }
    
    // Validate delivery info
    if (!deliveryForm.checkValidity()) {
        alert('Please fill all delivery information correctly');
        return false;
    }
    
    // Validate payment method
    if (!paymentForm.checkValidity()) {
        alert('Please complete payment information');
        return false;
    }
    
    return true;
}

// Initialize checkout
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    initCartIcon();

    // Continue Shopping button
    document.getElementById('continueShopping').addEventListener('click', () => {
        window.location.href = 'events.html';
    });

    // Save as favorite
    document.getElementById('saveFavorite').addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty! Add items before saving as favorite.');
            return;
        }

        localStorage.setItem('favoriteCart', JSON.stringify(cart));
        alert('Cart saved as favorite!');
    });

    // Apply favorites
    document.getElementById('applyFavorite').addEventListener('click', () => {
        const favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts'));
        if (!favoriteProducts || favoriteProducts.length === 0) {
            alert('No favorite products found! Add some favorites first.');
            return;
        }

        // Convert favorite products to cart format
        const cartItems = favoriteProducts.map(product => ({
            product_id: product.id,
            quantity: 1
        }));

        localStorage.setItem('cart', JSON.stringify(cartItems));
        renderCart(); // Update UI with favorite cart
        alert('Favorites added to cart!');
    });

    // Buy Now button
    document.getElementById('buyNow').addEventListener('click', (e) => {
        e.preventDefault();
        if (validateCheckoutForm()) {
            // Process order here
            alert('Order placed successfully!');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        }
    });

    // Payment form submission
    document.getElementById('payButton').addEventListener('click', (e) => {
        e.preventDefault();

        // Get all form elements
        const personalForm = document.getElementById('personalForm');
        const deliveryForm = document.getElementById('deliveryForm');
        const paymentForm = document.getElementById('paymentForm');
        const creditCardFields = document.getElementById('creditCardFields');
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        // Validate personal details
        if (!personalForm.checkValidity()) {
            alert('Please fill in all personal details');
            return;
        }

        // Validate delivery details
        if (!deliveryForm.checkValidity()) {
            alert('Please fill in all delivery details');
            return;
        }

        // Validate payment details
        if (paymentMethod === 'credit') {
            const cardNumber = document.getElementById('cardNumber');
            const expiry = document.getElementById('expiry');
            const cvv = document.getElementById('cvv');

            if (!cardNumber.value || !expiry.value || !cvv.value) {
                alert('Please fill in all credit card details');
                return;
            }

            // Basic format validation
            if (!/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ''))) {
                alert('Please enter a valid 16-digit card number');
                return;
            }

            if (!/^\d{2}\/\d{2}$/.test(expiry.value)) {
                alert('Please enter expiry date in MM/YY format');
                return;
            }

            if (!/^\d{3}$/.test(cvv.value)) {
                alert('Please enter a valid 3-digit CVV');
                return;
            }
        }

        // Get customer name for confirmation
        const customerName = document.getElementById('fullName').value;

        // Calculate delivery date (3 days from now)
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 3);

        const formattedDate = deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Show success message
        alert(`Thank you ${customerName} for your order!\nYour order will be delivered on ${formattedDate}.`);

        // Clear cart and forms
        localStorage.removeItem('cart');
        personalForm.reset();
        deliveryForm.reset();
        paymentForm.reset();

        // Reset cart display
        renderCart();

        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    });

    // Toggle credit card fields based on payment method
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const creditCardFields = document.getElementById('creditCardFields');
            creditCardFields.style.display = this.value === 'credit' ? 'block' : 'none';
            
            // Toggle required attributes for credit card fields
            const cardFields = creditCardFields.querySelectorAll('input');
            cardFields.forEach(field => {
                field.required = this.value === 'credit';
            });
        });
    });
});
