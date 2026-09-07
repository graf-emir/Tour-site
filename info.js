// ====== СЛАЙДЕР В ШАПКЕ САЙТА (ЗАЦИКЛЕННЫЙ ФОН) ======
function initHeaderSlider() {
    const slides = document.querySelectorAll('.header-slide');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000); // Интервал смены картинок — 5 секунд
}

// ====== 2. НЕЗАВИСИМЫЕ СЛАЙДЕРЫ ДЛЯ БЛОКОВ ИНФОРМАЦИИ ======
function initConnectingBroSliders() {
    // Находим ВСЕ блоки с информацией на странице
    const sections = document.querySelectorAll('.connectingBro');
    
    if (sections.length === 0) return;

    // Запускаем цикл для каждого блока отдельно
    sections.forEach((section) => {
        // Ищем слайды и кнопки СТРОГО внутри текущего блока section
        const slides = section.querySelectorAll('.media-slide');
        const prevBtn = section.querySelector('.prev-btn');
        const nextBtn = section.querySelector('.next-btn');

        // Если в этом конкретном блоке чего-то не хватает, пропускаем его
        if (slides.length === 0 || !prevBtn || !nextBtn) return;

        let currentIndex = 0;

        function showSlide(index) {
            // Скрываем текущий активный слайд в этом блоке
            slides[currentIndex].classList.remove('media-active');
            
            // Зацикливаем индекс (вперед и назад)
            if (index >= slides.length) {
                currentIndex = 0;
            } else if (index < 0) {
                currentIndex = slides.length - 1;
            } else {
                currentIndex = index;
            }

            // Показываем новый слайд в этом блоке
            slides[currentIndex].classList.add('media-active');
        }

        // Привязываем клики к кнопкам именно этого блока
        nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
        prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    });
}

// ====== 3. ЗАПУСК ВСЕХ СЛАЙДЕРОВ ======
document.addEventListener('DOMContentLoaded', () => {
    initHeaderSlider();
    initConnectingBroSliders();
});
