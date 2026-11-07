/* логика вывода товаров */
function renderProducts(productsToRender = productsData) {
    // Сортируем по названию (по алфавиту)
    productsToRender.sort((a, b) => a.title.localeCompare(b.title));

    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = "";

    if (productsToRender.length === 0) {
        container.innerHTML = "<p style='padding: 20px; font-size: 16px; grid-column: 1 / -1;'>По вашему запросу ничего не найдено.</p>";
        return;
    }

    productsToRender.forEach(product => {
                // вывод цены
        let displayPrice = product.price;
        if (product.sizes) {
            const sizeKeys = Object.keys(product.sizes);
            const firstPrice = product.sizes[sizeKeys[0]].price;
            
            if (sizeKeys.length > 1) {
                displayPrice = 'от ' + firstPrice + ' BYN'; // Если размеров несколько
            } else {
                displayPrice = firstPrice + ' BYN';         // Если размер один
            }
        }

        const cardHtml = `
            <div class="product-card" onclick="sessionStorage.setItem('scrollPosition', window.scrollY); window.location.href='product.html?id=${product.id}'">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <a href="product.html?id=${product.id}" class="product-title">${product.title}</a>
                <p class="product-price">${displayPrice}</p>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Восстановление прокрутки
    const savedScroll = sessionStorage.getItem('scrollPosition');
    if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem('scrollPosition');
    }
    
    renderProducts();

    const searchInput = document.getElementById('search-input');
    const resetBtn = document.getElementById('reset-filters');
    const productsContainer = document.getElementById('products-container');
    
    if (!productsContainer) return;

    /* ГЛАВНАЯ ФУНКЦИЯ ФИЛЬТРАЦИИ */
    function applyFilters() {
        // 1. Получаем текст поиска
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";
        
        // 2. Собираем ВСЕ выбранные чекбоксы (и запоминаем, в какой категории они находятся)
        const activeFilters = [];
        document.querySelectorAll('.category-item').forEach(item => {
            const categoryName = item.querySelector('.category-name').textContent.replace('▶', '').trim();
            const checkboxes = item.querySelectorAll('.filter-cb');
            
            let hasChecked = false;
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    activeFilters.push(cb.value);
                    hasChecked = true;
                }
            });

            // Если в этой категории есть выбранные чекбоксы, добавляем и саму категорию в фильтр
            if (hasChecked) {
                activeFilters.push(categoryName);
            }
        });

        // 3. Фильтруем базу данных
        const filteredProducts = productsData.filter(product => {
            // --- Проверка поиска ---
            if (searchQuery) {
                const matchesTitle = product.title.toLowerCase().includes(searchQuery);
                const matchesCategory = product.categories && product.categories.some(cat => cat.toLowerCase().includes(searchQuery));
                
                if (!matchesTitle && !matchesCategory) {
                    return false; 
                }
            }

            // --- Проверка чекбоксов (фильтров) ---
            if (activeFilters.length > 0) {
                // Товар должен содержать ВСЕ выбранные теги
                const hasAllTags = activeFilters.every(filterValue => {
                    return product.categories && product.categories.includes(filterValue);
                });

                if (!hasAllTags) {
                    return false;
                }
            }

            return true;
        });

        renderProducts(filteredProducts);
    }

    // Слушаем клики по чекбоксам
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('filter-cb')) {
            applyFilters();
        }
    });

    // Слушаем ввод в поиск
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }

    // Кнопка сброса
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = "";
            document.querySelectorAll('.filter-cb').forEach(cb => cb.checked = false);
            applyFilters();
        });
    }

    // --- Мобильные фильтры ---
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const sidebarWrapper = document.getElementById('sidebar-wrapper');
    const closeFilterBtn = document.getElementById('close-filter-btn');

    if (mobileFilterBtn && sidebarWrapper && closeFilterBtn) {
        mobileFilterBtn.addEventListener('click', () => {
            sidebarWrapper.classList.add('show');
            closeFilterBtn.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        closeFilterBtn.addEventListener('click', () => {
            sidebarWrapper.classList.remove('show');
            closeFilterBtn.style.display = 'none';
            document.body.style.overflow = '';
        });

        sidebarWrapper.addEventListener('click', (e) => {
            if (e.target === sidebarWrapper) {
                sidebarWrapper.classList.remove('show');
                closeFilterBtn.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

        // --- Аккордеон для главных категорий ---
    const level1Toggle = document.getElementById('level-1-toggle');
    const level2Menu = document.getElementById('level-2-menu');
    
    const level1TogglePots = document.getElementById('level-1-toggle-pots');
    const level2MenuPots = document.getElementById('level-2-menu-pots');

    // Открытие/закрытие "Постельное белье"
    if (level1Toggle && level2Menu) {
        level1Toggle.addEventListener('click', () => {
            level1Toggle.classList.toggle('active');
            level2Menu.classList.toggle('show');
            
            // Закрываем кастрюли, если они были открыты
            if (level1TogglePots && level2MenuPots) {
                level1TogglePots.classList.remove('active');
                level2MenuPots.classList.remove('show');
            }
        });
    }

    // Открытие/закрытие "Кастрюли"
    if (level1TogglePots && level2MenuPots) {
        level1TogglePots.addEventListener('click', () => {
            level1TogglePots.classList.toggle('active');
            level2MenuPots.classList.toggle('show');
            
            // Закрываем постельное белье, если оно было открыто
            if (level1Toggle && level2Menu) {
                level1Toggle.classList.remove('active');
                level2Menu.classList.remove('show');
            }
        });
    }

        // --- Аккордеон для "Сковороды" ---
    const level1TogglePans = document.getElementById('level-1-toggle-pans');
    const level2MenuPans = document.getElementById('level-2-menu-pans');

    if (level1TogglePans && level2MenuPans) {
        level1TogglePans.addEventListener('click', () => {
            level1TogglePans.classList.toggle('active');
            level2MenuPans.classList.toggle('show');
            
            // Закрываем остальные
            if (level1Toggle) { level1Toggle.classList.remove('active'); level2Menu.classList.remove('show'); }
            if (level1TogglePots) { level1TogglePots.classList.remove('active'); level2MenuPots.classList.remove('show'); }
        });
    }
});