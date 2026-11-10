/* логика вывода товаров */
function renderProducts(productsToRender = productsData) {
        // Сортируем: сначала сковородки, потом всё остальное по алфавиту
    productsToRender.sort((a, b) => {
        const aIsPan = a.title.toLowerCase().includes('сковорода');
        const bIsPan = b.title.toLowerCase().includes('сковорода');

        if (aIsPan && !bIsPan) return -1; // Сковорода всегда выше
        if (!aIsPan && bIsPan) return 1;  // Не сковорода всегда ниже
        return a.title.localeCompare(b.title); // Если оба сковороды или оба не сковороды — по алфавиту
    });

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

function applyFilters() {
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";

    // Группируем выбранные чекбоксы по data-filter
    const groupedFilters = {};
    document.querySelectorAll('.filter-cb:checked').forEach(cb => {
        const filterType = cb.dataset.filter;
        if (!filterType) {
            console.warn('У чекбокса нет data-filter:', cb);
            return;
        }
        if (!groupedFilters[filterType]) groupedFilters[filterType] = [];
        groupedFilters[filterType].push(cb.value);
    });

    const filteredProducts = productsData.filter(product => {
        // Поиск
        if (searchQuery) {
            const matchesTitle = product.title.toLowerCase().includes(searchQuery);
            const matchesCategory = product.categories &&
                product.categories.some(cat => cat.toLowerCase().includes(searchQuery));
            if (!matchesTitle && !matchesCategory) return false;
        }

        // Фильтры: И между группами, ИЛИ внутри группы
        for (const filterType in groupedFilters) {
            const values = groupedFilters[filterType];
            const hasMatch = values.some(value =>
                product.categories && product.categories.includes(value)
            );
            if (!hasMatch) return false;
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

        // --- Открытие подкатегорий на мобильных (Подушки, Комплекты и т.д.) ---
    const categoryNames = document.querySelectorAll('.category-name');
    categoryNames.forEach(name => {
        name.addEventListener('click', (e) => {
            // Работает только на телефонах (ширина < 768)
            if (window.innerWidth <= 768) {
                const parentItem = e.target.closest('.category-item');
                if (parentItem) {
                    parentItem.classList.toggle('open');
                }
            }
        });
    });
});