document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('favorites-container');
    const emptyMessage = document.getElementById('empty-fav-message');
    const favs = getFavorites();

    if (favs.length === 0) {
        container.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    container.innerHTML = "";
    emptyMessage.style.display = 'none';
    container.style.display = 'grid';

    favs.forEach(id => {
        const product = productsData.find(p => p.id == id);
        if (!product) return;

        const cardHtml = `
            <div class="product-card">
                                <div class="fav-icon-wrapper" onclick="removeFromFavPage(${product.id}, this)" title="Удалить из избранного">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#e62e6b" stroke="#e62e6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </div>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <a href="product.html?id=${product.id}" class="product-title">${product.title}</a>
                <p class="product-price">${
    product.sizes 
    ? (Object.keys(product.sizes).length > 1 
        ? 'от ' + Object.values(product.sizes)[0].price + ' BYN' 
        : Object.values(product.sizes)[0].price + ' BYN')
    : product.price
}</p>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
});

/* Удаление со страницы избранного */
function removeFromFavPage(productId, btnElement) {
    toggleFavorite(productId); // Удаляет из localStorage
    const card = btnElement.closest('.product-card');
    card.remove();

    const container = document.getElementById('favorites-container');
    if (container.children.length === 0) {
        container.style.display = 'none';
        document.getElementById('empty-fav-message').style.display = 'block';
    }
}