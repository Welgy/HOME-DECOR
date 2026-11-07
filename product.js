document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const product = productsData.find(p => p.id == productId);

    const container = document.getElementById('product-page');

    if (!product) {
        container.innerHTML = `<h2 style="text-align:center; padding: 50px;">Товар не найден</h2>`;
        return;
    }

    document.title = product.title + " — УЮТНЫЙ ДОМ";

    let currentSize = null;
    let currentPrice = product.price;
    let currentSpecs = product.specs || [];

    // Если есть размеры, берем первый по умолчанию
    if (product.sizes) {
        const sizeKeys = Object.keys(product.sizes);
        currentSize = sizeKeys[0];
        currentPrice = product.sizes[currentSize].price;
        currentSpecs = product.sizes[currentSize].specs;
    }

    // Функция отрисовки страницы
    function renderProduct() {
        let specsHtml = "";
        if (currentSpecs && currentSpecs.length > 0) {
            currentSpecs.forEach(spec => {
                const parts = spec.split(':');
                if (parts.length >= 2) {
                    specsHtml += `<tr><td>${parts[0].trim()}</td><td>${parts[1].trim()}</td></tr>`;
                } else {
                    specsHtml += `<tr><td colspan="2">${spec}</td></tr>`;
                }
            });
        }

        // Блок с карточками размеров
        let sizeCardsHtml = "";
        if (product.sizes) {
            sizeCardsHtml = `<div class="size-options">`;
            Object.keys(product.sizes).forEach(size => {
                const activeClass = size === currentSize ? 'active' : '';
                const sizePrice = product.sizes[size].price;
                sizeCardsHtml += `
                    <div class="size-card ${activeClass}" onclick="changeSize('${size}')">
                        <div class="size-title">${size}</div>
                        <div class="size-price">${sizePrice} BYN</div>
                    </div>
                `;
            });
            sizeCardsHtml += `</div>`;
        }

        container.innerHTML = `
            <div class="product-card-top">
                <div class="product-image-block">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                
                <div class="product-info-block">
                    <h1 class="product-title">${product.title}</h1>
                    
                    ${sizeCardsHtml}

                    <div class="product-price-row">
                        <span class="price-current">${currentPrice} BYN</span>
                    </div>
                    
                    <div class="action-buttons" style="display: flex; flex-direction: column; gap: 10px;">
                        <button class="btn-add-cart" onclick="addToCartWithSize()">🛒 Добавить в корзину</button>
                        <button class="btn-add-fav" onclick="toggleFavorite(${product.id})">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            Добавить в избранное
                        </button>
                    </div>
                </div>
            </div>

            <div class="product-details">
                <h2>Описание</h2>
                <div class="product-description">
                    ${product.description}
                </div>

                <h2>Характеристики</h2>
                <table class="specs-table">
                    ${specsHtml}
                </table>
            </div>
        `;

        // Логика избранного (перенесена внутрь)
        const isFav = getFavorites().includes(product.id);
        const favBtn = document.querySelector('.btn-add-fav');
        
        if (isFav && favBtn) {
            favBtn.style.backgroundColor = '#e62e6b';
            const svg = favBtn.querySelector('svg');
            if (svg) svg.style.fill = 'white';
        }
        
        if (favBtn) {
            favBtn.addEventListener('click', () => {
                const nowFav = getFavorites().includes(product.id);
                if (nowFav) {
                    favBtn.style.backgroundColor = '#e62e6b';
                    favBtn.querySelector('svg').style.fill = 'white';
                } else {
                    favBtn.style.backgroundColor = '#1a1a1a';
                    favBtn.querySelector('svg').style.fill = 'none';
                }
            });
        }
    }

    // Функция смены размера
    window.changeSize = function(size) {
        currentSize = size;
        currentPrice = product.sizes[size].price;
        currentSpecs = product.sizes[size].specs;
        renderProduct();
    };

    // Функция добавления в корзину с учетом размера
    window.addToCartWithSize = function() {
        // Передаем ID товара, название размера и финальную цену
        addToCart(product.id, currentSize, currentPrice);
    };

    renderProduct(); 
});