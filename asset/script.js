
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');

    if (username === 'gdmr' && password === 'gdmr') {
        document.getElementById('login-overlay').style.display = 'none';
        document.querySelector('.header').style.display = 'block';
        document.querySelector('.container').style.display = 'block';
    } else {
        errorElement.textContent = 'Invalid username or password';
    }
}

document.getElementById('password').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        login();
    }
});

let assetData = [];

window.addEventListener('load', function() {
    fetch('assets.json')
        .then(response => response.json())
        .then(data => {
            assetData = data;
        })
        .catch(error => console.error('Error loading asset data:', error));
});

function searchStore() {
    const query = document.getElementById('searchQuery').value.trim().toLowerCase();
    
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.innerHTML = '';
    
    let filteredAssets = assetData;

    if (query) {
        filteredAssets = assetData.filter(asset => {
            const storeName = asset.storeName ? asset.storeName.trim().toLowerCase() : '';
            const spaceCode = asset.spaceCode ? asset.spaceCode.trim().toLowerCase() : '';
            const category = asset.category ? asset.category.trim().toLowerCase() : '';
            const location = asset.location ? asset.location.trim().toLowerCase() : '';
            const material = asset.material ? asset.material.trim().toLowerCase() : '';
            const inventoryMedium = asset.inventoryMedium ? asset.inventoryMedium.trim().toLowerCase() : '';
            const inventoryType = asset.inventoryType ? asset.inventoryType.trim().toLowerCase() : '';

            return (
                storeName.includes(query) ||
                spaceCode.includes(query) ||
                category.includes(query) ||
                location.includes(query) ||
                material.includes(query) ||
                inventoryMedium.includes(query) ||
                inventoryType.includes(query)
            );
        });
    }

    const groupedByStore = filteredAssets.reduce((acc, asset) => {
        const storeName = asset.storeName;
        if (!acc[storeName]) {
            acc[storeName] = [];
        }
        acc[storeName].push(asset);
        return acc;
    }, {});

    if (Object.keys(groupedByStore).length > 0) {
        displayResults(groupedByStore);
        resultsSection.style.display = 'block';
    } else {
        resultsSection.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;"><h3>No assets found matching your criteria</h3></div>';
        resultsSection.style.display = 'block';
    }
}

let cart = [];

function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.textContent = message;
    toast.className = "toast-notification show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

function addToCart(assetId) {
    const asset = findAsset(assetId);
    if (asset && !cart.find(item => item.id === asset.id)) {
        cart.push(asset);
        updateCartIcon();
        showToast(`Added ${asset.spaceCode} (${asset.category}) to cart!`);
    }
}

function updateCartIcon() {
    const cartIcon = document.getElementById('cart-icon');
    cartIcon.querySelector('span').textContent = cart.length;
}

function openCart() {
    const cartBody = document.getElementById('cart-body');
    cartBody.innerHTML = '';

    if (cart.length === 0) {
        cartBody.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        const cartGrid = document.createElement('div');
        cartGrid.className = 'assets-grid';
        cartGrid.innerHTML = cart.map(asset => `
            <div class="asset-card">
                <div class="asset-header">
                    <span class="asset-type">${asset.inventoryMedium}</span>
                    <span class="asset-id">${asset.spaceCode}</span>
                </div>
                <div class="asset-thumbnail">
                    ${asset.image ? `<img src="${asset.image}" alt="${asset.category}">` : '<div class="no-image">No image</div>'}
                </div>
                <h3 class="asset-title">${asset.category}</h3>
                <ul class="asset-details">
                    <li><strong>Size:</strong> <span>${asset.width} x ${asset.height}</span></li>
                    <li><strong>Location:</strong> <span>${asset.location}</span></li>
                    <li><strong>Material:</strong> <span>${asset.material}</span></li>
                </ul>
                <button class="remove-from-cart-btn" onclick="removeFromCart('${asset.id}')">Remove</button>
            </div>
        `).join('');
        cartBody.appendChild(cartGrid);
    }

    document.getElementById('cart-modal').style.display = 'flex';
}

function removeFromCart(assetId) {
    const index = cart.findIndex(item => item.id == assetId);
    if (index > -1) {
        cart.splice(index, 1);
        updateCartIcon();
        openCart();
    }
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function displayResults(groupedStores) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.innerHTML = ''; // Clear previous results

    for (const storeName in groupedStores) {
        const assets = groupedStores[storeName];
        const storeElement = document.createElement('div');
        
        const firstAsset = assets[0];
        
        storeElement.innerHTML = `
            <div class="store-info">
                <div class="store-header">
                    <h2 class="store-title">${storeName}</h2>
                    <div class="store-code">Zone: ${firstAsset.zone} / Grade: ${firstAsset.grade}</div>
                </div>
                
                <div class="assets-grid">
                    ${assets.map(asset => `
                        <div class="asset-card">
                            <div class="add-to-cart-btn" onclick="addToCart('${asset.id}')">+</div>
                            <div onclick="openLightbox('${asset.id}')">
                                <div class="asset-header">
                                    <span class="asset-type">${asset.inventoryMedium}</span>
                                    <span class="asset-id">${asset.spaceCode}</span>
                                </div>
                                <div class="asset-thumbnail">
                                    ${asset.image ? `<img src="${asset.image}" alt="${asset.category}">` : '<div class="no-image">Click to view details</div>'}
                                </div>
                                <h3 class="asset-title">${asset.category}</h3>
                                <ul class="asset-details">
                                    <li><strong>Size:</strong> <span>${asset.width} x ${asset.height}</span></li>
                                    <li><strong>Location:</strong> <span>${asset.location}</span></li>
                                    <li><strong>Material:</strong> <span>${asset.material}</span></li>
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        resultsSection.appendChild(storeElement);
    }
}


function openLightbox(assetId) {
    const asset = findAsset(assetId);
    if (!asset) return;
    
    document.getElementById('lightboxTitle').textContent = asset.category;
    document.getElementById('lightboxBody').innerHTML = `
        <div>
            <div class="asset-thumbnail" style="height: 300px; margin-bottom: 2rem;">
                ${asset.image ? `<img src="${asset.image}" alt="${asset.category}" class="asset-image">` : '<div class="no-image">No image available</div>'}
            </div>
            <h3 style="color: var(--thunder-bird); margin-bottom: 1rem;">Asset Information</h3>
            <ul class="asset-details">
                <li><strong>Asset ID:</strong> <span>${asset.spaceCode}</span></li>
                <li><strong>Type:</strong> <span>${asset.inventoryMedium}</span></li>
                <li><strong>Size:</strong> <span>${asset.width} x ${asset.height}</span></li>
                <li><strong>Location:</strong> <span>${asset.location}</span></li>
                <li><strong>Material:</strong> <span>${asset.material}</span></li>
            </ul>
        </div>
        <div>
            <h3 style="color: var(--thunder-bird); margin-bottom: 1rem;">Measurements & Specifications</h3>
            <table class="measurements-table">
                <thead>
                    <tr>
                        <th>Dimension</th>
                        <th>Measurement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Width</td><td>${asset.width}</td></tr>
                    <tr><td>Height</td><td>${asset.height}</td></tr>
                    <tr><td>Depth</td><td>${asset.depth}</td></tr>
                    <tr><td>Quantity</td><td>${asset.qty}</td></tr>
                    <tr><td>Cost</td><td>${asset.cost}</td></tr>
                </tbody>
            </table>
            
            <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                <h4 style="color: var(--thunder-bird); margin-bottom: 0.5rem;">Notes</h4>
                <p style="color: #666; font-style: italic;">
                    Zone: ${asset.zone}, Grade: ${asset.grade}, Level: ${asset.level}
                </p>
            </div>
        </div>
    `;
    
    document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

function findAsset(assetId) {
    return assetData.find(asset => asset.id == assetId);
}

// Close lightbox when clicking outside
document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

// Auto-search when user types
document.getElementById('searchQuery').addEventListener('input', debounce(autoSearch, 500));

function autoSearch() {
    searchStore();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
