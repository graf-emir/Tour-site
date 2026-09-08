document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');

    if (!tourId) {
        document.body.innerHTML = '<div class="main"><h2>Ошибка: Тур не найден. <a href="index.html">На главную</a></h2></div>';
        return;
    }

    fetch('/api/get-tours')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.tours.length > 0) {
            const currentTour = data.tours.find(t => t.id === tourId);

            if (currentTour) {
                // Заполняем текстовые данные
                document.getElementById('tourTitle').innerText = currentTour.name;
                document.getElementById('tourDate').innerText = currentTour.date;
                document.getElementById('tourPrice').innerText = currentTour.price;
                document.getElementById('tourDesc').innerText = currentTour.description;
                document.getElementById('bookBtn').href = `index.html?tour=${encodeURIComponent(currentTour.name)}#tgOrderForm`;

                // ====== СБОРКА СЛАЙДЕРА ГАЛЕРЕИ ======
                const slidesContainer = document.getElementById('slidesContainer');
                
                // ИСПРАВЛЕНО: Безопасная проверка. Если галерея существует и это массив с элементами — берем её. 
                // Если галерея пустая (undefined), создаем массив из одной главной картинки.
                const imagesToRender = (currentTour.gallery && Array.isArray(currentTour.gallery) && currentTour.gallery.length > 0) 
                    ? currentTour.gallery 
                    : [currentTour.image];

                imagesToRender.forEach((imgUrl, index) => {
                    const slideDiv = document.createElement('div');
                    // Если индекс равен 0, слайд сразу будет видимым (slide-active)
                    slideDiv.className = `details-slide ${index === 0 ? 'slide-active' : ''}`;
                    
                    const img = document.createElement('img');
                    img.src = imgUrl;
                    img.alt = `${currentTour.name} - фото ${index + 1}`;
                    
                    slideDiv.appendChild(img);
                    slidesContainer.appendChild(slideDiv);
                });

                // Инициализируем управление стрелками
                initDetailsSlider(imagesToRender.length);


            } else {
                document.getElementById('tourTitle').innerText = 'Тур не найден';
            }
        }
    })
    .catch(error => {
        console.error('Ошибка загрузки деталей тура:', error);
    });
});

// Функция работы стрелок слайдера деталей
function initDetailsSlider(totalSlides) {
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    
    // Если картинка всего одна, прячем стрелочки, они не нужны
    if (totalSlides <= 1 && prevArrow && nextArrow) {
        prevArrow.style.display = 'none';
        nextArrow.style.display = 'none';
        return;
    }

    let currentIndex = 0;

    function changeSlide(direction) {
        const slides = document.querySelectorAll('.details-slide');
        slides[currentIndex].classList.remove('slide-active');

        currentIndex += direction;

        // Зацикливание слайдов
        if (currentIndex >= totalSlides) currentIndex = 0;
        if (currentIndex < 0) currentIndex = totalSlides - 1;

        slides[currentIndex].classList.add('slide-active');
    }

    if (nextArrow) nextArrow.addEventListener('click', () => changeSlide(1));
    if (prevArrow) prevArrow.addEventListener('click', () => changeSlide(-1));
}
