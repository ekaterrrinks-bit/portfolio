# Портфолио flaxss

Одностраничное портфолио в стиле **macOS-десктопа** на чистом HTML + CSS + JS.
Чёрный AMOLED-фон, неоновая подсветка, анимированная загрузка сайта.
Деплоится на GitHub Pages.

## Что внутри

- **Меню-бар** — живые часы (время + дата), переключатель музыки.
- **Окно** с боковой навигацией — «перелистывание» секций анимацией (Главная, Проекты, Навыки, Музыка, Соцсети).
- **Музыка** — настоящий синтезатор на Web Audio API (3 генерируемых трека, не нужен интернет/файлы): играет прямо в браузере, есть скраббер и плейлист.
- **Соцсети** — кнопки-карточки (GitHub, Telegram, VK, почта).
- **Время и uptime** в сайдбаре, **кастомный favicon** (неоновое «F»).
- Прелоадер: «загрузка» → чёрный экран → белый → сайт.

## Откуда файлы

- `favicon.svg` — значок сайта.
- `fonts/` — Plus Jakarta Sans + JetBrains Mono (woff2, офлайн).
- `css/all.min.css` + `webfonts/` — Font Awesome (иконки, офлайн).

## Как редактировать

- Тексты, проекты, соцсети — в `index.html` (секции `.content-pane`).
- Палитра и шрифты — `:root` в `css/style.css`.
- Треки (ноты, темп, стиль) — массив `TRACKS` в `js/main.js`.
- Тайминги загрузки — функция `timeline` в `js/main.js`.

## Локальный просмотр

```bash
python3 -m http.server 8000
# открыть http://localhost:8000
```

## Публикация на GitHub Pages

```bash
git init
git branch -M main
git remote add origin https://github.com/ekaterrrinks-bit/portfolio.git
git add .
git commit -m "Портфолио: macOS-десктоп"
git push -u origin main
```

Pages для репозитория уже включены: `https://ekaterrrinks-bit.github.io/portfolio/`.