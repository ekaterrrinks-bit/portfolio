(() => {
  'use strict';

  // Текущий год в подвале
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const preloader = document.getElementById('preloader');
  const body = document.body;

  if (!preloader) {
    body.classList.add('loaded');
    return;
  }

  // Блокируем скролл, пока идёт загрузка
  body.classList.add('no-scroll');

  const hideBody = () => body.classList.add('loaded');
  const removePreloader = () => {
    if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
    body.classList.remove('no-scroll');
  };

  // Последовательность: "загрузка" -> чёрный экран -> белый -> сайт
  const timeline = () => {
    hideBody();
    // стадия 2: плавный уход в чёрный (контент прелоадера уходит, фон -> #000)
    setTimeout(() => preloader.classList.add('stage-black'), 1700);
    // стадия 3: белая вспышка
    setTimeout(() => preloader.classList.add('stage-white'), 2450);
    // стадия 4: прелоадер растворяется, открывая сайт
    setTimeout(() => preloader.classList.add('done'), 2800);
    setTimeout(removePreloader, 3700);
  };

  // Показываем прелоадер минимум ~2.2 с (плюс ожидание загрузки шрифтов)
  const fontsReady = document.fonts && document.fonts.ready
    ? document.fonts.ready.catch(() => {})
    : Promise.resolve();

  Promise.all([fontsReady, new Promise((r) => setTimeout(r, 2200))]).then(timeline);

  // Ripple на кнопках
  document.querySelectorAll('.btn').forEach((el) => {
    el.classList.add('ripple-wrap');
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height);
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = d + 'px';
      span.style.left = e.clientX - rect.left - d / 2 + 'px';
      span.style.top = e.clientY - rect.top - d / 2 + 'px';
      el.appendChild(span);
      setTimeout(() => span.remove(), 700);
    });
  });

  // Подсветка карточек за курсором
  document.querySelectorAll('.project').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });

  // Прогресс-бары: заполняются по достижении видимости
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target.querySelector('.bar span');
          if (bar) bar.style.width = bar.dataset.level + '%';
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll('.skill').forEach((skill) => {
    const span = skill.querySelector('.bar span');
    if (span) {
      if (!span.dataset.level) span.dataset.level = '0';
      span.style.width = '0%';
      barObserver.observe(skill);
    }
  });

  // Reveal-анимации элементов при скролле
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
})();