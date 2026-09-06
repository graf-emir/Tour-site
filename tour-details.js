document.addEventListener('DOMContentLoaded', function() {
    // 1. Получаем ID тура из ссылки (например: tour-details.html?id=recXXXXX)
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');

    if (!tourId) {
        document.body.innerHTML = '<div class="main"><h2>Ошибка: Тур не найден. <a href="index.html">На главную</a></h2></div>';
        return;
    }

    // 2. Запрашиваем все туры через наш бэкенд
    fetch('/api/get-tours')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.tours.length > 0) {
            // Ищем конкретный тур по его ID
            const currentTour = data.tours.find(t => t.id === tourId);

            if (currentTour) {
                // 3. Заполняем HTML данными из Airtable
                document.getElementById('tourTitle').innerText = currentTour.name;
                document.getElementById('tourDate').innerText = currentTour.date;
                document.getElementById('tourPrice').innerText = currentTour.price;
                document.getElementById('tourDesc').innerText = currentTour.description;
                
                const img = document.getElementById('tourImage');
                img.src = currentTour.image;
                img.alt = currentTour.name;

                // Настраиваем кнопку бронирования, чтобы она автоматически вписывала имя тура в анкету
                document.getElementById('bookBtn').href = `index.html?tour=${encodeURIComponent(currentTour.name)}#tgOrderForm`;
            } else {
                document.getElementById('tourTitle').innerText = 'Тур не найден';
            }
        }
    })
    .catch(error => {
        console.error('Ошибка загрузки деталей тура:', error);
    });
});
