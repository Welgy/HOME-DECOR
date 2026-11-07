/* Функция для пересчета цены из строки в число */
function parsePrice(priceStr) {
    // Если пришла пустота или не строка — возвращаем 0
    if (!priceStr || typeof priceStr !== 'string') return 0;
    
    const cleanStr = priceStr.replace(/[^\d]/g, '');
    return parseInt(cleanStr) || 0;
}

/* Функция для отрисовки корзины */
function renderCartPage() {
    const cart = getCart();
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    const emptyMessage = document.getElementById('empty-cart-message');
    const totalElement = document.getElementById('cart-total-price');

    if (cart.length === 0) {
        container.innerHTML = "";
        summary.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    summary.style.display = 'flex';
    container.innerHTML = "";

    let totalPrice = 0;

        cart.forEach(cartItem => {
        const product = productsData.find(p => p.id == cartItem.id);
        if (!product) return;
        
                // Если товар не найден в базе, пропускаем его, чтобы не было ошибки
        if (!product) {
            console.warn("Товар не найден в базе:", cartItem.id);
            return; 
        }

        // Если у товара есть кастомная цена (размер), берем её
        const finalPrice = cartItem.customPrice ? cartItem.customPrice : parsePrice(product.price);
        
        let displayPrice = "";
        if (cartItem.customPrice) {
            displayPrice = `${cartItem.customPrice} BYN`;
        } else if (product.sizes) {
            const firstSize = Object.keys(product.sizes)[0];
            displayPrice = 'от ' + product.sizes[firstSize].price + ' BYN';
        } else {
            displayPrice = product.price;
        }
        
        // Добавляем размер к названию, если он есть
        const displayTitle = cartItem.size ? `${product.title} (${cartItem.size})` : product.title;

        totalPrice += finalPrice * cartItem.quantity;

        const itemHtml = `
            <div class="cart-item" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <div class="cart-item-info">
                    <img src="${product.image}" alt="${product.title}" class="cart-item-image">
                    <div>
                        <a href="product.html?id=${product.id}" class="cart-item-title" onclick="event.stopPropagation()">${displayTitle}</a>
                        <div class="cart-item-price">${displayPrice}</div>
                    </div>
                </div>
                <div class="cart-item-controls" onclick="event.stopPropagation()">
                    <button class="quantity-btn" onclick="changeQuantity('${cartItem.cartItemId}', -1)">−</button>
                    <span>${cartItem.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity('${cartItem.cartItemId}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${cartItem.cartItemId}')">🗑️</button>
                </div>
            </div>
        `;
        container.innerHTML += itemHtml;
    });

    totalElement.textContent = totalPrice.toLocaleString('ru-RU') + ' руб';
}

function changeQuantity(cartItemId, delta) {
    let cart = getCart();
    const item = cart.find(i => i.cartItemId === cartItemId);
    
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.cartItemId !== cartItemId);
        }
        saveCart(cart);
        renderCartPage();
    }
}

function removeFromCart(cartItemId) {
    let cart = getCart();
    cart = cart.filter(i => i.cartItemId !== cartItemId);
    saveCart(cart);
    renderCartPage();
}

/* оформление заказа */
function checkout() {
    const cart = getCart();
    if (cart.length === 0) return;

    const modalHtml = `
        <div id="checkout-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 40px 30px; border-radius: 16px; max-width: 450px; width: 90%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.2); position: relative;">
                
                <div style="width: 60px; height: 60px; background: #f0f4ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#194693" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>

                <h2 style="margin-top: 0; color: #1a1a1a; font-size: 22px;">Подтверждение заказа</h2>
                
                <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                    Для завершения оформления, пожалуйста, <strong>позвоните нашему менеджеру</strong>. Мы уточним наличие товара и ответим на все вопросы.
                </p>

                <a href="tel:+375296554780" style="display: block; background: #194693; color: white; text-decoration: none; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 18px; margin-bottom: 15px; transition: background 0.2s;">
                    📞 +375 29 655-47-80
                </a>
                
                <p style="color: #999; font-size: 13px; margin-bottom: 20px;">Нажмите, чтобы позвонить с телефона</p>

                <button onclick="document.getElementById('checkout-modal').remove()" style="background: none; border: none; color: #888; text-decoration: underline; cursor: pointer; font-size: 14px;">Вернуться в корзину</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // === НОВЫЙ КОД: Закрытие по клику вне окна ===
    const modal = document.getElementById('checkout-modal');
    modal.addEventListener('click', (e) => {
        // Если клик был именно по фону (а не по карточке внутри), закрываем
        if (e.target === modal) {
            modal.remove();
        }
    });
}

document.addEventListener("DOMContentLoaded", renderCartPage);