document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('header a[href^="#"]');

  navBtns.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // -----------------------------------------------------------
        // НАСТРОЙКА ОТСТУПА:
        // Вариант А (в процентах от высоты экрана):
        // 0.15 = блок встанет на уровне 15% от верха экрана
        const topOffsetPercent = 0.10; 
        const offset = window.innerHeight * topOffsetPercent;

        // Вариант Б (в фиксированных пикселях, например под шапку 80px):
        // const offset = 80; 
        // -----------------------------------------------------------

        // Считаем точную позицию элемента с учетом прокрутки страницы
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        // Плавно скроллим в точные координаты
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});