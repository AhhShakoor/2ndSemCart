// Modified renderCart function
async function renderCart() {
    // Load products data first
    const products = await fetch('products.json').then(res => res.json());
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cartItems');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartTotalEl = document.getElementById('cartTotal');
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

    // Update subtotal & total
    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalEl.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;

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
        const favoriteCart = JSON.parse(localStorage.getItem('favoriteCart'));
        if (!favoriteCart) {
            alert('No favorite cart found! Save a favorite first.');
            return;
        }

        localStorage.setItem('cart', JSON.stringify(favoriteCart));
        renderCart(); // Update UI with favorite cart
        alert('Favorite cart applied!');
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

    // Payment method toggle
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

// Handle payment process
document.getElementById('payButton').addEventListener('click', (e) => {
    e.preventDefault();
    const personalForm = document.getElementById('personalForm');
    const deliveryForm = document.getElementById('deliveryForm');
    const paymentForm = document.getElementById('paymentForm');

    if (personalForm.checkValidity() && deliveryForm.checkValidity() && paymentForm.checkValidity()) {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 3); // 3-day delivery

        const customerName = document.getElementById('name').value;
        const formattedDate = deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        alert(`Thank you ${customerName} for your purchase!\nYour order will be delivered on ${formattedDate}.`);
        
        // Clear cart and forms
        localStorage.removeItem('cart');
        personalForm.reset();
        deliveryForm.reset();
        paymentForm.reset();
        renderCart(); // Reset cart UI
        
        // Optional: Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        alert('Please fill out all required fields correctly.');
    }
});
