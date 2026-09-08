document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('toursContainer');
    const template = document.getElementById('tourTemplate');
    const input = document.getElementById('itemName');
    
    // Вместо datalist теперь ищем наш новый кастомный контейнер для подсказок
    const suggestionsContainer = document.getElementById('customSuggestions');

    if (!container || !template) return;

    // Сюда будем собирать имена туров для поиска по ним
    const tourNames = [];

    fetch('/api/get-tours')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.tours.length > 0) {
            container.innerHTML = ''; 
            if (suggestionsContainer) suggestionsContainer.innerHTML = '';

            data.tours.forEach(tour => {
                // СОХРАНЯЕМ ИМЯ ТУРА ДЛЯ АВТОЗАПОЛНЕНИЯ (Airtable не ломается)
                tourNames.push(tour.name);

                // Создаем клон карточки из шаблона
                const cardClone = template.content.cloneNode(true);
                
                // Заполняем данные карточки
                cardClone.querySelector('.nameTour').innerText = tour.name;
                cardClone.querySelector('.tourDate').innerText = tour.date;
                const img = cardClone.querySelector('.tourImg');
                img.src = tour.image;
                img.alt = `Фото тура: ${tour.name}`;

                const readMoreBtn = cardClone.querySelector('.readMore');
                if (readMoreBtn) {
                    if (readMoreBtn.tagName === 'A') {
                        readMoreBtn.href = `tour-details.html?id=${tour.id}`;
                    } else {
                        readMoreBtn.addEventListener('click', () => {
                            window.location.href = `tour-details.html?id=${tour.id}`;
                        });
                    }
                }

                // Добавляем готовую карточку на главную страницу
                container.appendChild(cardClone);
            });

            // ЗАПУСКАЕМ НАШЕ КАСТОМНОЕ АВТОЗАПОЛНЕНИЕ ПОСЛЕ ЗАГРУЗКИ ТУРОВ
            initCustomAutocomplete();

        } else {
            container.innerHTML = '<p>На данный момент активных туров нет.</p>';
        }
    })
    .catch(error => {
        console.error('Ошибка загрузки каталога:', error);
    });
    
    // Функция, которая рулит подсказками и не пропадает на телефонах
    function initCustomAutocomplete() {
        if (!input || !suggestionsContainer) return;

        const showSuggestions = (value) => {
            const query = value.toLowerCase().trim();
            suggestionsContainer.innerHTML = '';
            
            if (!query) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            // Ищем совпадения по сохраненным именам
            const filteredTours = tourNames.filter(name => name.toLowerCase().includes(query));

            if (filteredTours.length > 0) {
                filteredTours.forEach(tourName => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = tourName;
                    
                    // Клик или тап пальцем по подсказке
                    const selectTour = (e) => {
                        e.preventDefault();
                        input.value = tourName;
                        suggestionsContainer.style.display = 'none';
                    };
                    
                    item.addEventListener('click', selectTour);
                    item.addEventListener('touchend', selectTour);
                    
                    suggestionsContainer.appendChild(item);
                });
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        };

        // Слушаем ввод и фокус на инпуте
        input.addEventListener('input', (e) => showSuggestions(e.target.value));
        input.addEventListener('focus', (e) => showSuggestions(e.target.value));

        // Закрываем список, если кликнули мимо инпута
        document.addEventListener('click', (e) => {
            if (e.target !== input && e.target !== suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    // Код автозаполнения анкеты (если вернулись со второй страницы)
    const urlParams = new URLSearchParams(window.location.search);
    const chosenTour = urlParams.get('tour');
    if (chosenTour && input) {
        input.value = chosenTour;
    }
});



///////////////////////////////////////////////////////////////////////////////////

document.getElementById('tgOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Собираем данные
    const formData = {
        itemName: document.getElementById('itemName').value,
        userName: document.getElementById('userName').value,
        userEmail: document.getElementById('userEmail').value,
        userPhone: document.getElementById('userPhone').value
    };

    const statusText = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.disabled = true;
    statusText.style.color = '#fff';
    statusText.innerText = 'Отправка...';

    // Отправляем данные на нашу серверную функцию Vercel
    fetch('/api/send-tg.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            statusText.style.color = '#28a745';
            statusText.innerText = 'Заявка успешно отправлена!';
            document.getElementById('tgOrderForm').reset();
        } else {
            statusText.style.color = '#dc3545';
            statusText.innerText = 'Ошибка отправки. Попробуйте позже.';
        }
    })
    .catch(error => {
        statusText.style.color = '#dc3545';
        statusText.innerText = 'Ошибка сети.';
        console.error('Ошибка:', error);
    })
    .finally(() => {
        submitBtn.disabled = false;
    });
});

///////////////////////////////////////////////////////////////////////////////////

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

// ====== СЛАЙДЕР В СЕКЦИИ CONNECTINGBRO (ВИДЕО + ФОТО) ======
function initHostSlider() {
    const slides = document.querySelectorAll('.media-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slides.length === 0 || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    
    function showSlide(index) {
        slides[currentIndex].classList.remove('media-active');
        currentIndex = index;
        
        // Зацикливание слайдера
        if (currentIndex >= slides.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = slides.length - 1;
        
        slides[currentIndex].classList.add('media-active');
    }
    
    nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
    prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
}

// Запуск всех слайдеров после полной загрузки HTML
document.addEventListener('DOMContentLoaded', () => {
    initHeaderSlider();
    initHostSlider();
});

//////////////////////////////////////////////////////////////

document.querySelector('.copy-phone-btn').addEventListener('click', function() {
    // Получаем номер телефона из атрибута data-phone
    const phoneNumber = this.getAttribute('data-phone');
    
    // Копируем текст в буфер обмена
    navigator.clipboard.writeText(phoneNumber).then(() => {
        // Здесь можно настроить уведомление для пользователя
    }).catch(err => {
        console.error('Ошибка при копировании: ', err);
    });
});

///////////////////////////////////////////////////////////////////

function copyEmail() {
    navigator.clipboard.writeText('mememe@gmail.com');
}
