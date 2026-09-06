document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('toursContainer');
    const template = document.getElementById('tourTemplate');
    const datalist = document.getElementById('toursList');

    if (!container || !template) return;

    fetch('/api/get-tours')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.tours.length > 0) {
            container.innerHTML = ''; 
            if (datalist) datalist.innerHTML = '';

            data.tours.forEach(tour => {
                // Создаем клон карточки из шаблона
                const cardClone = template.content.cloneNode(true);
                
                // Заполняем данные карточки
                cardClone.querySelector('.nameTour').innerText = tour.name;
                cardClone.querySelector('.tourDate').innerText = tour.date;
                const img = cardClone.querySelector('.tourImg');
                img.src = tour.image;
                img.alt = `Фото тура: ${tour.name}`;

                // --- ВОТ СЮДА НАДО ПЕРЕНЕСТИ ЭТОТ КУСОК КОДА ---
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
                // ----------------------------------------------

                // Добавляем подсказку для анкеты
                if (datalist) {
                    const option = document.createElement('option');
                    option.value = tour.name;
                    datalist.appendChild(option);
                }

                // Добавляем готовую карточку на главную страницу
                container.appendChild(cardClone);
            });
        } else {
            container.innerHTML = '<p>На данный момент активных туров нет.</p>';
        }
    })
    .catch(error => {
        console.error('Ошибка загрузки каталога:', error);
    });
    
    // Код автозаполнения анкеты (если вернулись со второй страницы)
    const urlParams = new URLSearchParams(window.location.search);
    const chosenTour = urlParams.get('tour');
    if (chosenTour && document.getElementById('itemName')) {
        document.getElementById('itemName').value = chosenTour;
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
