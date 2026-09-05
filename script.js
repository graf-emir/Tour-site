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
