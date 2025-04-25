// Get DOM elements if they exist
const listProductHTML = document.querySelector('.listProduct');
const listCartHTML = document.querySelector('.listCart');
const iconCart = document.querySelector('.icon-cart');
const iconCartSpan = document.querySelector('.icon-cart span');
const body = document.querySelector('body');
const closeCart = document.querySelector('.close');

let products = [];
let cart = [];
let favorites = [];

// Initialize cart icon on every page
const updateCartIcon = () => {
    const iconSpan = document.querySelector('.icon-cart span');
    if (iconSpan) {
        const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
        iconSpan.innerText = totalQuantity;
    }
};

// Add cart event listeners only if elements exist
if (iconCart && body) {
    iconCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    });
}

if (closeCart && body) {
    closeCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    });
}

const addDataToHTML = () => {
    // Clear existing content from all product grids
    document.querySelectorAll('.parts-grid').forEach(grid => grid.innerHTML = '');

    if (products.length > 0) {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = `
                <div class="product-card">
                    <div class="favorite-heart" data-id="${product.id}">♥</div>
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-info">
                        <h2>${product.name}</h2>
                    </div>
                    <div class="product-actions">
                        <div class="price">$${product.price}</div>
                        <button class="addCart">Add To Cart</button>
                    </div>
                </div>
            `;

            // Add to appropriate category section
            switch (product.category) {
                case 'processors':
                    document.getElementById('processors').appendChild(newProduct);
                    break;
                case 'graphics':
                    document.getElementById('graphics').appendChild(newProduct);
                    break;
                case 'motherboards':
                    document.getElementById('motherboards').appendChild(newProduct);
                    break;
                case 'memory':
                    document.getElementById('memory').appendChild(newProduct);
                    break;
                case 'storage':
                    document.getElementById('storage').appendChild(newProduct);
                    break;
                default:
                    listProductHTML.appendChild(newProduct);
            }
        });
    }
};

// Toggle favorite function
const toggleFavorite = (productId) => {
    // Get the product details
    const product = products.find(p => p.id == productId);
    if (!product) return;

    // Load existing favorites
    let favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    
    // Check if product is already in favorites
    const index = favoriteProducts.findIndex(item => item.id == productId);
    
    if (index === -1) {
        // Add to favorites
        favoriteProducts.push(product);
        alert('Product added to favorites!');
    } else {
        // Remove from favorites
        favoriteProducts.splice(index, 1);
        alert('Product removed from favorites!');
    }

    // Save updated favorites
    localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
    updateHeartIcons();
};

// Update heart icons based on favorites
const updateHeartIcons = () => {
    const favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    document.querySelectorAll('.favorite-heart').forEach(heart => {
        const productId = heart.dataset.id;
        heart.classList.toggle('active', favoriteProducts.some(item => item.id == productId));
    });
};

// Handle favorite heart clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('favorite-heart')) {
        toggleFavorite(e.target.dataset.id);
    }
});

// Handle Add to Cart button clicks
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('addCart')) {
        let productElement = event.target.closest('.item');
        addToCart(productElement.dataset.id);
        // Scroll down smoothly by 200 pixels
        window.scrollBy({
            top: 200,
            behavior: 'smooth'
        });
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if (cart.length <= 0 || positionThisProductInCart < 0) {
        cart.push({ product_id: product_id, quantity: 1 });
    } else {
        cart[positionThisProductInCart].quantity += 1;
    }
    addCartToMemory();
    // Only update cart HTML if we're on a page with cart display
    if (listCartHTML) {
        addCartToHTML();
    } else {
        // Always update cart icon
        updateCartIcon();
    }
};

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const addCartToHTML = () => {
    if (!listCartHTML) return; // Skip if not on a page with cart display
    
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            if (!info) return; // Skip if product info not found

            newItem.innerHTML = `
                <div class="image"><img src="${info.image}"></div>
                <div class="name">${info.name}</div>
                <div class="totalPrice">$${info.price * item.quantity}</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
            listCartHTML.appendChild(newItem);
        });
    }
    updateCartIcon();
};

const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity += 1;
                break;
            case 'minus':
                if (cart[positionItemInCart].quantity > 1) {
                    cart[positionItemInCart].quantity -= 1;
                } else {
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
        addCartToHTML();
        addCartToMemory();
    }
};

// Add cart quantity change listeners only if cart exists
if (listCartHTML) {
    listCartHTML.addEventListener('click', (event) => {
        let positionClick = event.target;
        if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
            let product_id = positionClick.parentElement.parentElement.dataset.id;
            let type = positionClick.classList.contains('plus') ? 'plus' : 'minus';
            changeQuantityCart(product_id, type);
        }
    });
}

const initApp = async () => {
    try {
        // Load cart from localStorage first
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Update cart icon immediately
        updateCartIcon();

        // Only fetch products if we're on a page that needs them
        if (listProductHTML || listCartHTML) {
            const response = await fetch('products.json');
            products = await response.json();
            
            if (listProductHTML) {
                addDataToHTML();
                updateHeartIcons();
            }
            if (listCartHTML) {
                addCartToHTML();
            }
        }
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
};

initApp();
