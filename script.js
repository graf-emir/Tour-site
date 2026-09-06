document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('toursContainer');
    const template = document.getElementById('tourTemplate');
    // НАХОДИМ НАШ DATALIST
    const datalist = document.getElementById('toursList');

    if (!container || !template) return;

    fetch('/api/get-tours')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.tours.length > 0) {
            container.innerHTML = ''; 
            if (datalist) datalist.innerHTML = ''; // Очищаем старые подсказки, если были

            data.tours.forEach(tour => {
                // 1. Старый код отрисовки карточек в каталоге
                const cardClone = template.content.cloneNode(true);
                cardClone.querySelector('.nameTour').innerText = tour.name;
                cardClone.querySelector('.tourDate').innerText = tour.date;
                const img = cardClone.querySelector('.tourImg');
                img.src = tour.image;
                img.alt = `Фото тура: ${tour.name}`;
                container.appendChild(cardClone);

                // 2. НОВЫЙ КОД: Создаем подсказку для анкеты в подвале
                if (datalist) {
                    const option = document.createElement('option');
                    option.value = tour.name; // Записываем название тура из Airtable в подсказку
                    datalist.appendChild(option);
                }
            });
        } else {
            container.innerHTML = '<p>На данный момент active туров нет.</p>';
        }
    })
    .catch(error => {
        console.error('Ошибка загрузки каталога:', error);
        container.innerHTML = '<p style="color: red;">Не удалось загрузить туры.</p>';
    });
});


///////////////////////////////////////////////////////////////////////////////////

document.getElementById('tgOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const statusText = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.disabled = true;
    statusText.style.color = '#fff';
    statusText.innerText = 'Отправка заявки и файла...';

    // Используем FormData для автоматического сбора текста и файлов
    const formData = new FormData();
    formData.append('itemName', document.getElementById('itemName').value);
    formData.append('userName', document.getElementById('userName').value);
    formData.append('userEmail', document.getElementById('userEmail').value);
    formData.append('userPhone', document.getElementById('userPhone').value);

    // Проверяем, прикрепил ли пользователь файл
    const fileInput = document.getElementById('userReceipt');
    if (fileInput.files.length > 0) {
        formData.append('receipt', fileInput.files[0]);
    }

    // Отправляем данные на нашу серверную функцию Vercel
    fetch('/api/send-telegram', {
        method: 'POST',
        // Заголовок Content-Type указывать НЕ НАДО, браузер поставит multipart/form-data сам!
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            statusText.style.color = '#28a745';
            statusText.innerText = 'Заявка и чек успешно отправлены!';
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
